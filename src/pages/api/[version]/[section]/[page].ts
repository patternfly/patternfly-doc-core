import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version, section, page } = params

  if (!version || !section || !page) {
    return createJsonResponse(
      { error: 'Version, section, and page parameters are required' },
      400,
    )
  }

  try {
    const index = await fetchApiIndex(url)
    const key = createIndexKey(version, section, page)
    const tabs = index.tabs[key]

    if (!tabs) {
      return createJsonResponse(
        {
          error: `Page '${page}' not found in section '${section}' for version '${version}'`,
        },
        404,
      )
    }

    return createJsonResponse(tabs)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load API index' },
      500
    )
  }
}
