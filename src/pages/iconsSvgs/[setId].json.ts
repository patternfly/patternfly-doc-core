import type { APIRoute, GetStaticPaths } from 'astro'
import { IconsManifest } from 'react-icons/lib'
import { getIconSvgsForSet } from '../../utils/icons/reactIcons'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getIconSvgsForSet() uses dynamic imports of react-icons which fail in Workers.
 */
export const prerender = true

export const getStaticPaths: GetStaticPaths = async () =>
  IconsManifest.map((m) => ({
    params: { setId: m.id },
  }))

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
