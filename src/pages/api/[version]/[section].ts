import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../utils/apiIndex/fetch'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version, section } = params

  if (!version || !section) {
    return createJsonResponse(
      { error: 'Version and section parameters are required' },
      400,
    )
  }

  try {
    const index = await fetchApiIndex(url)
    const key = createIndexKey(version, section)
    const pages = index.pages[key]

    if (!pages) {
      return createJsonResponse(
        { error: `Section '${section}' not found for version '${version}'` },
        404,
      )
    }

    return createJsonResponse(pages)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load API index' },
      500
    )
  }
}
