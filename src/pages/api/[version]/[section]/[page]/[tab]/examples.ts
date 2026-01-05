import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../../../utils/apiIndex/fetch'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version, section, page, tab } = params

  if (!version || !section || !page || !tab) {
    return createJsonResponse(
      { error: 'Version, section, page, and tab parameters are required' },
      400,
    )
  }

  // Get examples with titles directly from the index
  try {
    const index = await fetchApiIndex(url)
    const tabKey = createIndexKey(version, section, page, tab)
    const examples = index.examples[tabKey] || []

    return createJsonResponse(examples)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load API index', details },
      500,
    )
  }
}



