import type { APIRoute } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../../content'
import { kebabCase } from '../../../utils'
import { createJsonResponse } from '../../../utils/apiHelpers'

export const prerender = false

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const GET: APIRoute = async ({ params }) => {
  const { version, section } = params

  if (!version || !section) {
    return createJsonResponse(
      { error: 'Version and section parameters are required' },
      400,
    )
  }

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

  const pages = new Set<string>()
  collections.flat().forEach((entry: ContentEntry) => {
    if (entry.data.section === section) {
      pages.add(kebabCase(entry.data.id))
    }
  })

  if (pages.size === 0) {
    return createJsonResponse(
      { error: `Section '${section}' not found for version '${version}'` },
      404,
    )
  }

  return createJsonResponse(Array.from(pages).sort())
}
