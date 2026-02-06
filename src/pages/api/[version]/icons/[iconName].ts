import type { APIRoute } from 'astro'
import {
  createJsonResponse,
  createSvgResponse,
} from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'
import { getIconSvg, parseIconId } from '../../../../utils/icons/reactIcons'

export const prerender = false

/**
 * GET /api/{version}/icons/[icon-name]
 * Returns actual SVG markup for the icon.
 * Icon name format: {set}_{iconName} (e.g., fa_FaCircle, md_MdHome)
 */
export const GET: APIRoute = async ({ params, url }) => {
  const { version, iconName: iconId } = params

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
  } catch {
    return createJsonResponse({ error: 'Failed to fetch API index' }, 500)
  }

  if (!iconId) {
    return createJsonResponse(
      { error: 'Icon name parameter is required' },
      400,
    )
  }

  const parsed = parseIconId(iconId)
  if (!parsed) {
    return createJsonResponse(
      {
        error: 'Invalid icon name format',
        expected: 'Use format {set}_{iconName} (e.g., fa_FaCircle, md_MdHome)',
      },
      400,
    )
  }

  const { setId, iconName } = parsed
  const svg = await getIconSvg(setId, iconName)

  if (!svg) {
    return createJsonResponse([]);
  }

  return createSvgResponse(svg)
}
