import type { CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../content'
import { getDefaultTabForApi } from '../packageUtils'

export type EnrichedContentEntry = {
  filePath: string
  data: {
    tab: string
    [key: string]: any
  }
  [key: string]: any
}

/**
 * Fetches and enriches all content collections for a specific version
 * Enriches entries with default tab information if not specified
 *
 * @param version - The documentation version (e.g., 'v6')
 * @returns Promise resolving to array of collection entries with enriched metadata
 */
export async function getEnrichedCollections(version: string): Promise<EnrichedContentEntry[]> {
  const collectionsToFetch = content
    .filter((entry) => entry.version === version)
    .map((entry) => entry.name as CollectionKey)

  const collections = await Promise.all(
    collectionsToFetch.map((name) => getCollection(name))
  )

  return collections.flat().map(({ data, filePath, ...rest }) => ({
    filePath,
    ...rest,
    data: {
      ...data,
      tab: data.tab || data.source || getDefaultTabForApi(filePath),
    },
  }))
}
