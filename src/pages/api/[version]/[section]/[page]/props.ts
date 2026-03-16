import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../../utils/apiHelpers'
import { fetchProps } from '../../../../../utils/propsData/fetch'
import { removeSubsection } from '../../../../../utils/case'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { page } = params

  if (!page) {
    return createJsonResponse(
      { error: 'Page parameter is required' },
      400,
    )
  }

  try {
    const props = await fetchProps(url)
    const propsData = props[removeSubsection(page)]

    if (propsData === undefined) {
      return createJsonResponse(
        { error: `Props data for ${page} not found` },
        404,
      )
    }

    return createJsonResponse(propsData)

  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load props data', details },
      500,
    )
  }
}
