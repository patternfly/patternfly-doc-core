import type { APIRoute } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../content'
import { createJsonResponse } from '../../utils/apiHelpers'

export const prerender = false

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const GET: APIRoute = async ({ params }) => {
  const { version } = params

  if (!version) {
    return createJsonResponse(
      { error: 'Version parameter is required' },
      400,
    )
  }

  // Build version map: collection name -> version
  const versionMap = new Map<string, string>()
  content.forEach((entry) => {
    if (entry.version) {
      versionMap.set(entry.name, entry.version)
    }
  })

  // Get collections that match the version
  const collectionsToFetch = content
    .filter((entry) => entry.version === version)
    .map((entry) => entry.name as CollectionKey)

  if (collectionsToFetch.length === 0) {
    return createJsonResponse({ error: `Version '${version}' not found` }, 404)
  }

  const collections = await Promise.all(
    collectionsToFetch.map(async (name) => await getCollection(name)),
  )

  const sections = new Set<string>()
  collections.flat().forEach((entry: ContentEntry) => {
    if (entry.data.section) {
      sections.add(entry.data.section)
    }
  })

  return createJsonResponse(Array.from(sections).sort())
}
