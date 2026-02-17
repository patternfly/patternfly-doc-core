import type { APIRoute, GetStaticPaths } from 'astro'
import { getVersionsFromIndexFile } from '../../../../utils/apiIndex/get'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { getIconSvgsForSet } from '../../../../utils/icons/reactIcons'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getIconSvgsForSet() reads from @patternfly/react-icons/dist/static (Node fs).
 * Serves JSON of all icon SVGs for a set (e.g. /api/v5/icons/pf.json).
 */
export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  const versions = await getVersionsFromIndexFile()
  return versions.flatMap((version) => [
    { params: { version, setId: 'pf' } },
  ])
}

export const GET: APIRoute = async ({ params }) => {
  const { version, setId } = params
  if (!version) {
    return createJsonResponse(
      { error: 'Version parameter is required' },
      400,
    )
  }
  if (!setId) {
    return createJsonResponse({ error: 'Set ID is required' }, 400)
  }

  try {
    const svgs = await getIconSvgsForSet(setId)
    return createJsonResponse(svgs)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load icon SVGs', details },
      500,
    )
  }
}
