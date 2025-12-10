import type { APIRoute } from 'astro'
import { getApiIndex } from '../utils/apiIndex/get'

// Prerender at build time so this doesn't run in the Cloudflare Worker
export const prerender = true

export const GET: APIRoute = async () => {
  try {
    const index = await getApiIndex()
    return new Response(JSON.stringify(index), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to load API index' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
