import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../utils/apiIndex/fetch'
import { getTokenCategories } from '../../../utils/tokens'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version } = params

  if (!version) {
    return createJsonResponse({ error: 'Version parameter is required' }, 400)
  }

  try {
    const index = await fetchApiIndex(url)
    if (!index.versions.includes(version)) {
      return createJsonResponse(
        { error: `Version '${version}' not found` },
        404,
      )
    }

    const categories = getTokenCategories()
    return createJsonResponse(categories)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load tokens', details: error },
      500,
    )
  }
}
