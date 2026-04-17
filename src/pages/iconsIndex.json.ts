import type { APIRoute } from 'astro'
import { getAllIcons } from '../utils/icons/reactIcons'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getAllIcons() reads from @patternfly/react-icons/dist/static (Node fs).
 */
export const prerender = true

export const GET: APIRoute = async () => {
  try {
    const icons = await getAllIcons()
    return new Response(JSON.stringify({ icons }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to load icons index', details: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
