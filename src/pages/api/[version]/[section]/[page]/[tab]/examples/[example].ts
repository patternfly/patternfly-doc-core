/* eslint-disable no-console */
import type { APIRoute, GetStaticPaths } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { content } from '../../../../../../../content'
import { kebabCase, addDemosOrDeprecated } from '../../../../../../../utils'
import { getDefaultTabForApi } from '../../../../../../../utils/packageUtils'
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

/**
 * Extracts import statements from file content
 * Matches import statements with relative paths (starting with ./ or ../)
 *
 * @param fileContent - The file content to parse
 * @returns Array of import statements or null if none found
 */
function getImports(fileContent: string): string[] | null {
  // Match import statements with relative paths
  // Supports: import X from './path', import X from "../path/file.tsx"
  const importRegex = /import\s+.*\s+from\s+['"]\.{1,2}\/[^'"]+['"]/gm
  const matches = fileContent.match(importRegex)
  return matches
}

/**
 * Extracts the file path for a specific example from import statements
 * Looks for imports that reference the example name
 *
 * @param imports - Array of import statements
 * @param exampleName - Name of the example to find
 * @returns Relative file path without quotes (including query params like ?raw), or null if not found
 */
function getExampleFilePath(imports: string[], exampleName: string): string | null {
  const exampleImport = imports.find((imp) => imp.includes(exampleName))
  if (!exampleImport) {
    console.error('No import path found for example', exampleName)
    return null
  }
  // Extract path from import statement, handling query parameters like ?raw
  // Matches: "./path" or "../path" with optional file extensions and query params
  const match = exampleImport.match(/['"](\.[^'"]+)['"]/i)
  if (!match || !match[1]) {
    return null
  }
  return match[1]
}

/**
 * Fetches all content collections for a specific version
 * Enriches entries with default tab information if not specified
 *
 * @param version - The documentation version (e.g., 'v6')
 * @returns Promise resolving to array of collection entries with metadata
 */
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
      tab: data.tab || data.source || getDefaultTabForApi(filePath),
    },
  }))
}

/**
 * Finds the file path for a content entry matching the given parameters
 * Prefers .mdx files over .md files when both exist, since .mdx files
 * contain the LiveExample components and example imports
 *
 * @param collections - Array of collection entries to search
 * @param section - The section name (e.g., 'components')
 * @param page - The page slug (e.g., 'alert')
 * @param tab - The tab name (e.g., 'react')
 * @returns Promise resolving to the file path, or null if not found
 */
async function getContentEntryFilePath(
  collections: CollectionEntry<'core-docs' | 'quickstarts-docs' | 'react-component-docs'>[],
  section: string,
  page: string,
  tab: string
): Promise<string | null> {
  // Find all matching entries
  const matchingEntries = collections.filter((entry) => {
    const entryTab = addDemosOrDeprecated(entry.data.tab, entry.filePath)
    return (
      entry.data.section === section &&
      kebabCase(entry.data.id) === page &&
      entryTab === tab
    )
  })

  if (matchingEntries.length === 0) {
    console.error('No content entry found for section', section, 'page', page, 'tab', tab)
    return null
  }

  // Prefer .mdx files over .md files (mdx files have LiveExample components)
  const mdxEntry = matchingEntries.find((entry) =>
    typeof entry.filePath === 'string' && entry.filePath.endsWith('.mdx')
  )
  const contentEntry = mdxEntry || matchingEntries[0]

  if (typeof contentEntry.filePath !== 'string') {
    console.error('No file path found for content entry', contentEntry.id)
    return null
  }

  return contentEntry.filePath
}

/**
 * GET handler for retrieving example source code
 * Returns the raw source code for a specific example
 *
 * @param params - Route parameters: version, section, page, tab, example
 * @returns Response with example code as text/plain or error JSON
 */
export const GET: APIRoute = async ({ params }) => {
  const { version, section, page, tab, example } = params
  if (!version || !section || !page || !tab || !example) {
    return createJsonResponse(
      { error: 'Version, section, page, tab, and example parameters are required' },
      400
    )
  }

  try {
    const collections = await getCollections(version)
    const contentEntryFilePath = await getContentEntryFilePath(collections, section, page, tab)

    if (!contentEntryFilePath) {
      return createJsonResponse(
        { error: `Content entry not found for ${version}/${section}/${page}/${tab}` },
        404
      )
    }

    // Read content entry file to extract imports
    let contentEntryFileContent: string
    try {
      contentEntryFileContent = await readFile(contentEntryFilePath, 'utf8')
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      return createJsonResponse(
        { error: 'Failed to read content entry file', details },
        500
      )
    }

    const contentEntryImports = getImports(contentEntryFileContent)
    if (!contentEntryImports) {
      return createJsonResponse(
        { error: 'No imports found in content entry' },
        404
      )
    }

    const relativeExampleFilePath = getExampleFilePath(contentEntryImports, example)
    if (!relativeExampleFilePath) {
      return createJsonResponse(
        { error: `Example "${example}" not found in imports` },
        404
      )
    }

    // Strip query parameters (like ?raw) from the file path before reading
    const cleanFilePath = relativeExampleFilePath.split('?')[0]

    // Read example file
    const absoluteExampleFilePath = resolve(contentEntryFilePath, '../', cleanFilePath)
    let exampleFileContent: string
    try {
      exampleFileContent = await readFile(absoluteExampleFilePath, 'utf8')
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      // Check if it's a file not found error
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return createJsonResponse(
          { error: `Example file not found at path: ${relativeExampleFilePath}` },
          404
        )
      }
      return createJsonResponse(
        { error: 'Failed to read example file', details },
        500
      )
    }

    return createTextResponse(exampleFileContent)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Internal server error', details },
      500
    )
  }
}