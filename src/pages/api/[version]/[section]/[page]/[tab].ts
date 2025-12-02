import type { APIRoute, GetStaticPaths } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../../../../content'
import { kebabCase, getDefaultTab, addDemosOrDeprecated } from '../../../../../utils'
import { generateAndWriteApiIndex } from '../../../../../utils/apiIndex/generate'
import { getApiIndex } from '../../../../../utils/apiIndex/get'
import { createJsonResponse, createTextResponse, createIndexKey } from '../../../../../utils/apiHelpers'

export const prerender = true

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate index file for server-side routes to use
  // This runs once during build when getCollection() is available
  const index = await generateAndWriteApiIndex()

  const paths: { params: { version: string; section: string; page: string; tab: string } }[] = []

  // Build paths from index structure
  for (const version of index.versions) {
    for (const section of index.sections[version] || []) {
      const sectionKey = createIndexKey(version, section)
      for (const page of index.pages[sectionKey] || []) {
        const pageKey = createIndexKey(version, section, page)
        for (const tab of index.tabs[pageKey] || []) {
          paths.push({ params: { version, section, page, tab } })
        }
      }
    }
  }

  return paths
}

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page, tab } = params

  if (!version || !section || !page || !tab) {
    return createJsonResponse(
      { error: 'Version, section, page, and tab parameters are required' },
      400,
    )
  }

  // Validate using index first (fast path for 404s)
  const index = await getApiIndex()

  // Check if version exists
  if (!index.versions.includes(version)) {
    return createJsonResponse({ error: `Version '${version}' not found` }, 404)
  }

  // Check if section exists for this version
  const sectionKey = createIndexKey(version, section)
  if (!index.sections[version]?.includes(section)) {
    return createJsonResponse(
      { error: `Section '${section}' not found for version '${version}'` },
      404,
    )
  }

  // Check if page exists for this section
  const pageKey = createIndexKey(version, section, page)
  if (!index.pages[sectionKey]?.includes(page)) {
    return createJsonResponse(
      { error: `Page '${page}' not found in section '${section}' for version '${version}'` },
      404,
    )
  }

  // Check if tab exists for this page
  if (!index.tabs[pageKey]?.includes(tab)) {
    return createJsonResponse(
      {
        error: `Tab '${tab}' not found for page '${page}' in section '${section}' for version '${version}'`,
      },
      404,
    )
  }

  // Path is valid, now fetch the actual content
  const collectionsToFetch = content
    .filter((entry) => entry.version === version)
    .map((entry) => entry.name as CollectionKey)

  const collections = await Promise.all(
    collectionsToFetch.map((name) => getCollection(name)),
  )

  const flatEntries = collections
    .flat()
    .map(({ data, filePath, ...rest }) => ({
      filePath,
      ...rest,
      data: {
        ...data,
        tab: data.tab || data.source || getDefaultTab(filePath),
      },
    }))

  // Find the matching entry
  const matchingEntry = flatEntries.find((entry: ContentEntry) => {
    const entryTab = addDemosOrDeprecated(entry.data.tab, entry.id)
    return (
      entry.data.section === section &&
      kebabCase(entry.data.id) === page &&
      entryTab === tab
    )
  })

  // This shouldn't happen since we validated with index, but handle it anyway
  if (!matchingEntry) {
    // Log warning - indicates index/content mismatch
    console.warn(
      `[API Warning] Index exists but content not found: ${version}/${section}/${page}/${tab}. ` +
      'This may indicate a mismatch between index generation and actual content.'
    )
    return createJsonResponse(
      {
        error: `Content not found for tab '${tab}' in page '${page}', section '${section}', version '${version}'`,
      },
      404,
    )
  }

  // Get the raw body content (markdown/mdx text)
  const textContent = matchingEntry.body || ''

  return createTextResponse(textContent)
}
