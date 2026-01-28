import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'
import {
  getTokenCategories,
  getTokensForCategory,
  filterTokens,
} from '../../../../utils/tokens'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version, category } = params

  if (!version || !category) {
    return createJsonResponse(
      { error: 'Version and category parameters are required' },
      400,
    )
  }

  try {
    const index = await fetchApiIndex(url)
    if (!index.versions.includes(version)) {
      return createJsonResponse(
        { error: `Version '${version}' not found` },
        404,
      )
    }

    const tokens = getTokensForCategory(category)

    if (!tokens) {
      const validCategories = getTokenCategories()
      return createJsonResponse(
        {
          error: `Category '${category}' not found`,
          validCategories,
        },
        404,
      )
    }

    const filterParam = url.searchParams.get('filter')
    const filteredTokens = filterParam
      ? filterTokens(tokens, filterParam)
      : tokens

    return createJsonResponse(filteredTokens)
  } catch (error) {
    return createJsonResponse(
      { error: 'Failed to load tokens', details: error },
      500,
    )
  }
}
