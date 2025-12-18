import type { APIRoute, GetStaticPaths } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../../../../utils/apiHelpers'
import { getApiIndex } from '../../../../../../utils/apiIndex/get'
import { fetchApiIndex } from '../../../../../../utils/apiIndex/fetch'

export const prerender = false

export const getStaticPaths: GetStaticPaths = async () => {
  // Use the pre-generated index file
  const index = await getApiIndex()

  const paths: { params: { version: string; section: string; page: string; tab: string } }[] = []

  // Build paths from index structure
  for (const version of index.versions) {
    for (const section of index.sections[version] || []) {
      const sectionKey = createIndexKey(version, section)
      for (const page of index.pages[sectionKey] || []) {
        const pageKey = createIndexKey(version, section, page)
        for (const tab of index.tabs[pageKey] || []) {
          // Only create paths for tabs that have examples
          const tabKey = createIndexKey(version, section, page, tab)
          if (index.examples[tabKey] && index.examples[tabKey].length > 0) {
            paths.push({ params: { version, section, page, tab } })
          }
        }
      }
    }
  }

  return paths
}

export const GET: APIRoute = async ({ params, url }) => {
  const { version, section, page, tab } = params

  if (!version || !section || !page || !tab) {
    return createJsonResponse(
      { error: 'Version, section, page, and tab parameters are required' },
      400,
    )
  }

  // Get examples with titles directly from the index
  const index = await fetchApiIndex(url)
  const tabKey = createIndexKey(version, section, page, tab)
  const examples = index.examples[tabKey] || []

  return createJsonResponse(examples)
}



