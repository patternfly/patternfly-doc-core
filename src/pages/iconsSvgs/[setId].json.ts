import type { APIRoute, GetStaticPaths } from 'astro'
import { getIconSvgsForSet } from '../../utils/icons/reactIcons'

const PF_ICONS_SET_ID = 'pf'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getIconSvgsForSet() reads from @patternfly/react-icons/dist/static.
 */
export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => [
  { params: { setId: PF_ICONS_SET_ID } },
]

export const GET: APIRoute = async ({ params }) => {
  const { setId } = params

  if (!setId) {
    return new Response(
      JSON.stringify({ error: 'Set ID is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const svgs = await getIconSvgsForSet(setId)
    return new Response(JSON.stringify(svgs), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to load icon SVGs',
        details: String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
