import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../utils/apiHelpers'
import { versions as versionsData } from 'outputDir/apiIndex.json'

export const prerender = false

export const GET: APIRoute = async () => {
  const versions = versionsData

  return createJsonResponse(versions)
}
