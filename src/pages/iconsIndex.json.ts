import type { APIRoute } from 'astro'
import { getAllIcons } from '../utils/icons/reactIcons'

/**
 * Prerender at build time so this doesn't run in the Cloudflare Worker.
 * getAllIcons() uses dynamic imports of react-icons which fail in Workers
 * due to bundle size and Node.js compatibility.
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
