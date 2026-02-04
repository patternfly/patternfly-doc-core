import type { APIRoute } from 'astro'
import {
  createJsonResponse,
  createSvgResponse,
} from '../../../utils/apiHelpers'
import { getIconSvg, parseIconId } from '../../../utils/icons/reactIcons'

export const prerender = false

/**
 * GET /api/icons/[icon-name]
 * Returns actual SVG markup for the icon.
 * Icon name format: {set}_{iconName} (e.g., fa_FaCircle, md_MdHome)
 */
export const GET: APIRoute = async ({ params }) => {
  const iconId = params.iconName

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
    return createJsonResponse(
      { error: `Icon '${iconName}' not found in set '${setId}'` },
      404,
    )
  }

  return createSvgResponse(svg)
}
