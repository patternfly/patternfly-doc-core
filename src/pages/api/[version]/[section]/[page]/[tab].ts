/* eslint-disable no-console */
import type { APIRoute } from 'astro'
import { fetchApiIndex } from '../../../../../utils/apiIndex/fetch'
import { createJsonResponse, createIndexKey } from '../../../../../utils/apiHelpers'

export const prerender = false

export const GET: APIRoute = async ({ params, redirect, url }) => {
  const { version, section, page, tab } = params

  if (!version || !section || !page || !tab) {
    return createJsonResponse(
      { error: 'Version, section, page, and tab parameters are required' },
      400,
    )
  }

  // Validate using index first (fast path for 404s)
  const index = await fetchApiIndex(url)

  // Check if version exists
  if (!index.versions.includes(version)) {
    return createJsonResponse({ error: `Version '${version}' not found` }, 404)
  }

  // Check if section exists for this version
  const sectionKey = createIndexKey(version, section)
  if (!index.sections[version]?.includes(section)) {
    return createJsonResponse(
      { error: `Section '${section}' not found for version '${version}'` },
      404,
    )
  }

  // Check if page exists for this section
  const pageKey = createIndexKey(version, section, page)
  if (!index.pages[sectionKey]?.includes(page)) {
    return createJsonResponse(
      {
        error: `Page '${page}' not found in section '${section}' for version '${version}'`,
      },
      404,
    )
  }

  // Check if tab exists for this page
  if (!index.tabs[pageKey]?.includes(tab)) {
    return createJsonResponse(
      {
        error: `Tab '${tab}' not found for page '${page}' in section '${section}' for version '${version}'`,
      },
      404,
    )
  }

  // Redirect to the text endpoint
  return redirect(`${url.pathname}/text`)
}
