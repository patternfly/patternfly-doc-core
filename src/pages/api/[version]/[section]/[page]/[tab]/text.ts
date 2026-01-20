/* eslint-disable no-console */
import type { APIRoute, GetStaticPaths } from 'astro'
import { generateAndWriteApiIndex } from '../../../../../../utils/apiIndex/generate'
import { getApiIndex } from '../../../../../../utils/apiIndex/get'
import {
  createJsonResponse,
  createTextResponse,
} from '../../../../../../utils/apiHelpers'
import { getEnrichedCollections } from '../../../../../../utils/apiRoutes/collections'
import { findContentEntry } from '../../../../../../utils/apiRoutes/contentMatching'

export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate index file for server-side routes to use
  // This runs once during build when getCollection() is available
  const index = await generateAndWriteApiIndex()

  const paths: {
    params: { version: string; section: string; page: string; tab: string }
  }[] = []

  // Build paths from index structure
  // All tab keys are now 3-part: version::section::page (page may be underscore-separated for subsections)
  for (const [tabKey, tabs] of Object.entries(index.tabs)) {
    const parts = tabKey.split('::')

    if (parts.length === 3) {
      const [version, section, page] = parts
      for (const tab of tabs) {
        paths.push({
          params: {
            version,
            section,
            page,
            tab,
          },
        })
      }
    }
  }

  // This shouldn't happen since we have a fallback tab value, but if it somehow does we need to alert the user
  paths.forEach((path) => {
    if (!path.params.tab) {
      console.warn(`[API Warning] Tab not found for path: ${path.params.version}/${path.params.section}/${path.params.page}`)
    }
  })

  // Again, this shouldn't happen since we have a fallback tab value, but if it somehow does and we don't filter out tabless paths it will crash the build
  return paths.filter((path) => !!path.params.tab)
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
  const sections = index.sections[version] || []

  if (!sections.includes(section)) {
    return createJsonResponse(
      { error: `Section '${section}' not found for version '${version}'` },
      404,
    )
  }

  // Path is valid, now fetch the actual content
  const flatEntries = await getEnrichedCollections(version)

  // Find the matching entry (page may be underscore-separated for subsections like "forms_checkbox")
  const matchingEntry = findContentEntry(flatEntries, {
    section,
    page,
    tab,
  })

  // This shouldn't happen since we validated with index, but handle it anyway
  if (!matchingEntry) {
    // Log warning - indicates index/content mismatch
    console.warn(
      `[API Warning] Index exists but content not found: ${version}/${section}/${page}/${tab}. ` +
        'This may indicate a mismatch between index generation and actual content.',
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
