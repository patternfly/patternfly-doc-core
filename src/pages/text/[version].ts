import type { APIRoute } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../content'

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const GET: APIRoute = async ({ params }) => {
  const { version } = params

  if (!version) {
    return new Response(
      JSON.stringify({ error: 'Version parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
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
    return new Response(
      JSON.stringify({ error: `Version '${version}' not found` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
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

  return new Response(
    JSON.stringify(Array.from(sections).sort()),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export async function getStaticPaths() {
  const versions = new Set<string>()
  content.forEach((entry) => {
    if (entry.version) {
      versions.add(entry.version)
    }
  })

  return Array.from(versions).map((version) => ({
    params: { version },
  }))
}
