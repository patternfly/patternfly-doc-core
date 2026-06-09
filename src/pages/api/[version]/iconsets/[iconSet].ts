import type { APIRoute, GetStaticPaths } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { getIconSvgsForSet } from '../../../../utils/icons/reactIcons'
import { content } from '../../../../content'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getIconSvgsForSet() reads from @patternfly/react-icons/dist/static (Node fs).
 * Serves JSON of all icon SVGs for a set (e.g. /api/v6/iconsets/pf).
 */
export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = [...new Set(content.map((entry: any) => entry.version))]
  return versions.flatMap((version) => [
    { params: { version, iconSet: 'pf' } },
  ])
}

export const GET: APIRoute = async ({ params }) => {
  const { version, iconSet } = params
  if (!version) {
    return createJsonResponse(
      { error: 'Version parameter is required' },
      400,
    )
  }
  if (!iconSet) {
    return createJsonResponse({ error: 'Icon set is required' }, 400)
  }

  try {
    const svgs = await getIconSvgsForSet(iconSet)
    return createJsonResponse(svgs)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load icon SVGs', details },
      500,
    )
  }
}
