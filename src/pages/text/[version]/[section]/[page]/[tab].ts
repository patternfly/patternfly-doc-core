import type { APIRoute } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../../../../content'
import { kebabCase, getDefaultTab, addDemosOrDeprecated } from '../../../../../utils'

export const prerender = false

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page, tab } = params

  if (!version || !section || !page || !tab) {
    return new Response(
      JSON.stringify({
        error: 'Version, section, page, and tab parameters are required',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

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

  const flatEntries = collections
    .flat()
    .map(({ data, filePath, ...rest }) => ({
      filePath,
      ...rest,
      data: {
        ...data,
        tab: data.tab || data.source || getDefaultTab(filePath),
      },
    }))

  // Find the matching entry
  const matchingEntry = flatEntries.find((entry: ContentEntry) => {
    const entryTab = addDemosOrDeprecated(entry.data.tab, entry.id)
    return (
      entry.data.section === section &&
      kebabCase(entry.data.id) === page &&
      entryTab === tab
    )
  })

  if (!matchingEntry) {
    return new Response(
      JSON.stringify({
        error: `Tab '${tab}' not found for page '${page}' in section '${section}' for version '${version}'`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  // Get the raw body content (markdown/mdx text)
  const textContent = matchingEntry.body || ''

  return new Response(textContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
