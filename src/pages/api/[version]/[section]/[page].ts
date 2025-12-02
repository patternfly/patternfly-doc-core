import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../../../utils/apiHelpers'
import { tabs as tabsData } from '../../../../apiIndex.json'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page } = params

  if (!version || !section || !page) {
    return createJsonResponse(
      { error: 'Version, section, and page parameters are required' },
      400,
    )
  }

  const key = createIndexKey(version, section, page)
  const tabs = tabsData[key as keyof typeof tabsData]

  if (!tabs) {
    return createJsonResponse(
      {
        error: `Page '${page}' not found in section '${section}' for version '${version}'`,
      },
      404,
    )
  }

  return createJsonResponse(tabs)
}
