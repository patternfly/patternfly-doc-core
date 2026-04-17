import type { APIRoute } from 'astro'
import {
  createJsonResponse,
  createSvgResponse,
} from '../../../../utils/apiHelpers'
import { fetchApiIndex } from '../../../../utils/apiIndex/fetch'
import { fetchIconSvgs, fetchIconsIndex } from '../../../../utils/icons/fetch'

export const prerender = false

/**
 * GET /api/{version}/icons/[icon-name]
 * Returns actual SVG markup for the icon.
 * Icon name: React component name (e.g., FaCircle, MdHome)
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
  const { version, iconName: reactName } = params

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

  if (!reactName) {
    return createJsonResponse(
      { error: 'Icon name parameter is required' },
      400,
    )
  }

  const icons = await fetchIconsIndex(url)
  const icon = icons.find((i) => i.reactName === reactName)
  if (!icon) {
    return createJsonResponse(
      { error: `Icon '${reactName}' not found` },
      404,
    )
  }

  const svgs = await fetchIconSvgs(
    url,
    version,
    'pf',
    (locals as any)?.runtime?.env?.ASSETS?.fetch,
  )
  const svg = svgs?.[reactName] ?? null

  if (!svg) {
    return createJsonResponse(
      { error: `Icon '${reactName}' not found` },
      404,
    )
  }

  return createSvgResponse(svg)
}
