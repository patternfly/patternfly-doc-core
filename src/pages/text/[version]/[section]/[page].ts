import type { APIRoute } from 'astro'
import type { CollectionEntry, CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../../../content'
import {
  kebabCase,
  getDefaultTab,
  addDemosOrDeprecated,
} from '../../../../utils'

export const prerender = false

type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page } = params

  if (!version || !section || !page) {
    return new Response(
      JSON.stringify({
        error: 'Version, section, and page parameters are required',
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

  // Build tabs dictionary similar to the main page logic
  const tabsDictionary: Record<string, string[]> = collections
    .flat()
    .reduce((acc: Record<string, string[]>, entry: ContentEntry) => {
      const { tab: specifiedTab, source } = entry.data
      const hasTab = !!specifiedTab || !!source
      let tab = specifiedTab

      if (!hasTab) {
        tab = getDefaultTab(entry.filePath)
      } else {
        tab = addDemosOrDeprecated(specifiedTab, entry.id)
      }

      const tabEntry = acc[entry.data.id]
      
      if (tabEntry === undefined) {
        acc[entry.data.id] = [tab]
      } else if (!tabEntry.includes(tab)) {
        acc[entry.data.id] = [...tabEntry, tab]
      }

      return acc
    }, {})

  // Sort tabs
  const defaultOrder = 50
  const sourceOrder: Record<string, number> = {
    react: 1,
    'react-next': 1.1,
    'react-demos': 2,
    'react-deprecated': 2.1,
    html: 3,
    'html-demos': 4,
    'design-guidelines': 99,
    accessibility: 100,
    'upgrade-guide': 101,
    'release-notes': 102,
  }

  const sortSources = (s1: string, s2: string) => {
    const s1Index = sourceOrder[s1] || defaultOrder
    const s2Index = sourceOrder[s2] || defaultOrder
    if (s1Index === defaultOrder && s2Index === defaultOrder) {
      return s1.localeCompare(s2)
    }
    return s1Index > s2Index ? 1 : -1
  }

  Object.values(tabsDictionary).forEach((tabs: string[]) => {
    tabs.sort(sortSources)
  })

  // Find matching page
  const flatEntries = collections.flat()
  const matchingEntry = flatEntries.find(
    (entry: ContentEntry) =>
      entry.data.section === section && kebabCase(entry.data.id) === page,
  )

  if (!matchingEntry) {
    return new Response(
      JSON.stringify({
        error: `Page '${page}' not found in section '${section}' for version '${version}'`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const tabs = tabsDictionary[matchingEntry.data.id] || []

  return new Response(JSON.stringify(tabs), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
