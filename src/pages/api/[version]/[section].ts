import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../utils/apiHelpers'
import { pages as pagesData } from '../../../apiIndex.json'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { version, section } = params

  if (!version || !section) {
    return createJsonResponse(
      { error: 'Version and section parameters are required' },
      400,
    )
  }

  const key = createIndexKey(version, section)
  const pages = pagesData[key as keyof typeof pagesData]

  if (!pages) {
    return createJsonResponse(
      { error: `Section '${section}' not found for version '${version}'` },
      404,
    )
  }

  return createJsonResponse(pages)
}
