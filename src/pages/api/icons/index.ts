import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../utils/apiHelpers'
import { getAllIcons, filterIcons } from '../../../utils/icons/reactIcons'

export const prerender = false

/**
 * GET /api/icons
 * Returns list of all available icons with metadata.
 *
 * GET /api/icons?filter=circle
 * Returns filtered list of icons matching the filter term (case-insensitive).
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const filter = url.searchParams.get('filter') ?? ''
    const icons = await getAllIcons()
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
