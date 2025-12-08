import type { APIRoute } from 'astro'
import { createJsonResponse, createIndexKey } from '../../utils/apiHelpers'
import { sections as sectionsData } from 'outputDir/apiIndex.json'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { version } = params

  if (!version) {
    return createJsonResponse(
      { error: 'Version parameter is required' },
      400,
    )
  }

  const key = createIndexKey(version)
  const sections = sectionsData[key as keyof typeof sectionsData]

  if (!sections) {
    return createJsonResponse({ error: `Version '${version}' not found` }, 404)
  }

  return createJsonResponse(sections)
}
