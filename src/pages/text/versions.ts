import type { APIRoute } from 'astro'
import { content } from '../../content'

export const prerender = false

export const GET: APIRoute = async () => {
  const versions = new Set<string>()

  content.forEach((entry) => {
    if (entry.version) {
      versions.add(entry.version)
    }
  })

  return new Response(
    JSON.stringify(Array.from(versions).sort()),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
