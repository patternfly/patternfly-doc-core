import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'
import { fetchIconsIndex } from '../../../../utils/icons/fetch'
import { IconMetadata } from '../../../../utils/icons/icons'

export const prerender = false

/**
 * Filter icons by search term (case-insensitive match on name or reactName)
 */
export function filterIcons(
  icons: IconMetadata[],
  filter: string,
): IconMetadata[] {
  if (!filter || !filter.trim()) {
    return icons
  }
  const term = filter.toLowerCase().trim()
  return icons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(term) ||
      icon.reactName.toLowerCase().includes(term),
  )
}

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
