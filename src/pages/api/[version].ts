import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../utils/apiHelpers'
import { fetchApiIndex } from '../../utils/apiIndex/fetch'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version } = params

  if (!version) {
    return createJsonResponse(
      { error: 'Version parameter is required' },
      400,
    )
  }

  try {
    const index = await fetchApiIndex(url)
    const sections = index.sections[version]

    if (!sections) {
      return createJsonResponse({ error: `Version '${version}' not found` }, 404)
    }

    return createJsonResponse(sections)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load API index', details: error },
      500
    )
  }
}
