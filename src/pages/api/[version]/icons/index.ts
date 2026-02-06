import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'
import { fetchIconsIndex } from '../../../../utils/icons/fetch'
import { filterIcons } from '../../../../utils/icons/reactIcons'

export const prerender = false

/**
 * GET /api/{version}/icons
 * Returns list of all available icons with metadata.
 *
 * GET /api/{version}/icons?filter=circle
 * Returns filtered list of icons matching the filter term (case-insensitive).
 */
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
    if (!index.versions.includes(version)) {
      return createJsonResponse({ error: `Version '${version}' not found` }, 404)
    }

    const filter = url.searchParams.get('filter') ?? ''
    const icons = await fetchIconsIndex(url)
    const filtered = filterIcons(icons, filter)

    return createJsonResponse({
      icons: filtered,
      total: filtered.length,
      filter: filter || undefined,
    })
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load icons', details },
      500,
    )
  }
}
