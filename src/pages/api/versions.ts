import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../utils/apiHelpers'
import { fetchApiIndex } from '../../utils/apiIndex/fetch'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  try {
    const index = await fetchApiIndex(url)
    return createJsonResponse(index.versions)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load API index' },
      500
    )
  }
}
