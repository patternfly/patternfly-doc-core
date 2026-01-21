import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../../utils/apiIndex/fetch'

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
    const pageKey = createIndexKey(version, section, page)
    const cssTokens = index.css[pageKey] || []

    if (cssTokens.length === 0) {
      return createJsonResponse(
        {
          error: `No CSS tokens found for page '${page}' in section '${section}' for version '${version}'. CSS tokens are only available for content with a cssPrefix in the front matter.`,
        },
        404,
      )
    }

    return createJsonResponse(cssTokens)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load API index', details },
      500,
    )
  }
}
