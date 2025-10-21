import type { APIRoute } from 'astro'
import { content } from '../../content'
import { createJsonResponse } from '../../utils/apiHelpers'

export const prerender = false

export const GET: APIRoute = async () => {
  const versions = new Set<string>()

  content.forEach((entry) => {
    if (entry.version) {
      versions.add(entry.version)
    }
  })

  return createJsonResponse(Array.from(versions).sort())
}
