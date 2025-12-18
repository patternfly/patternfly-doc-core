import type { APIRoute, GetStaticPaths } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { content } from '../../../../../../../content'
import { kebabCase, getDefaultTab, addDemosOrDeprecated } from '../../../../../../../utils'
import { createJsonResponse, createTextResponse, createIndexKey } from '../../../../../../../utils/apiHelpers'
import { generateAndWriteApiIndex } from '../../../../../../../utils/apiIndex/generate'

export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate index file (will be cached if already generated)
  const index = await generateAndWriteApiIndex()

  const paths: {
    params: {
      version: string
      section: string
      page: string
      tab: string
      example: string
    }
  }[] = []

  // Build paths from index structure
  for (const version of index.versions) {
    for (const section of index.sections[version] || []) {
      const sectionKey = createIndexKey(version, section)
      for (const page of index.pages[sectionKey] || []) {
        const pageKey = createIndexKey(version, section, page)
        for (const tab of index.tabs[pageKey] || []) {
          const tabKey = createIndexKey(version, section, page, tab)

          // Get all examples for this tab
          const examples = index.examples[tabKey] || []
          for (const example of examples) {
            paths.push({
              params: {
                version,
                section,
                page,
                tab,
                example: example.exampleName,
              },
            })
          }
        }
      }
    }
  }

  return paths
}

function getImports(fileContent: string) {
  const importRegex = /import.*from.*['"]\..*\/[\w\.\?]*['"]/gm
  const matches = fileContent.match(importRegex)
  return matches
}

function getExampleFilePath(imports: string[], exampleName: string) {
  const exampleImport = imports.find((imp) => imp.includes(exampleName))
  if (!exampleImport) {
    console.error('No import path found for example', exampleName)
    return null
  }
  const match = exampleImport.match(/['"]\..*\/[\w\.]*\?/)
  if (!match) {
    return null
  }
  return match[0].replace(/['"?]/g, '')
}

async function getCollections(version: string) {
  const collectionsToFetch = content
    .filter((entry) => entry.version === version)
    .map((entry) => entry.name as CollectionKey)
  const collections = await Promise.all(
    collectionsToFetch.map(async (name) => await getCollection(name)),
  )
  return collections.flat().map(({ data, filePath, ...rest }) => ({
    filePath,
    ...rest,
    data: {
      ...data,
      tab: data.tab || data.source || getDefaultTab(filePath),
    },
  }))
}

async function getContentEntryFilePath(collections: CollectionEntry<'core-docs' | 'quickstarts-docs' | 'react-component-docs'>[], section: string, page: string, tab: string) {
  const contentEntry = collections.find((entry) => entry.data.section === section && kebabCase(entry.data.id) === page && entry.data.tab === tab)
  if (!contentEntry) {
    console.error('No content entry found for section', section, 'page', page, 'tab', tab)
    return null
  }
  if (typeof contentEntry.filePath !== 'string') {
    console.error('No file path found for content entry', contentEntry.id)
    return null
  }
  return contentEntry.filePath
}

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page, tab, example } = params
  if (!version || !section || !page || !tab || !example) {
    return createJsonResponse({ error: 'Version, section, page, tab, and example parameters are required' }, 400)
  }

  const collections = await getCollections(version)
  const contentEntryFilePath = await getContentEntryFilePath(collections, section, page, tab)
  
  if (!contentEntryFilePath) {
    return createJsonResponse({ error: 'Content entry not found' }, 404)
  }

  const contentEntryFileContent = await readFile(contentEntryFilePath, 'utf8')

  const contentEntryImports = getImports(contentEntryFileContent)
  if (!contentEntryImports) {
    return createJsonResponse({ error: 'Content entry imports not found' }, 404)
  }

  const relativeExampleFilePath = getExampleFilePath(contentEntryImports, example)
  if (!relativeExampleFilePath) {
    return createJsonResponse({ error: 'Example file path not found' }, 404)
  }

  const absoluteExampleFilePath = resolve(contentEntryFilePath, '../', relativeExampleFilePath)
  const exampleFileContent = await readFile(absoluteExampleFilePath, 'utf8')

  return createTextResponse(exampleFileContent)
}