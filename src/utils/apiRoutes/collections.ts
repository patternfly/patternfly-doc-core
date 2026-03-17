import type { CollectionKey } from 'astro:content'
import { getCollection } from 'astro:content'
import { content } from '../../content'
import { getDefaultTabForApi } from '../packageUtils'

export type EnrichedContentEntry = {
  filePath: string
  base?: string
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
  const contentEntries = content.filter((entry) => entry.version === version)

  const collections = await Promise.all(
    contentEntries.map((entry) => getCollection(entry.name as CollectionKey))
  )

  return collections.flatMap((collectionEntries, index) => {
    const base = contentEntries[index].base
    return collectionEntries.map(({ data, filePath = '', ...rest }) => ({
      filePath,
      base,
      ...rest,
      data: {
        ...data,
        tab: data.tab || data.source || getDefaultTabForApi(filePath),
      },
    }))
  })
}
