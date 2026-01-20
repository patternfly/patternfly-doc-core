import type { CollectionEntry } from 'astro:content'
import { kebabCase, addDemosOrDeprecated } from '../index'
import type { EnrichedContentEntry } from './collections'

export type ContentEntry = CollectionEntry<
  'core-docs' | 'quickstarts-docs' | 'react-component-docs'
>

export interface ContentMatchParams {
  section: string
  page: string
  tab: string
}

/**
 * Finds a content entry matching the specified parameters
 * Handles both regular pages and subsection pages (with flattened underscore-separated names)
 *
 * @param entries - Array of enriched content entries to search
 * @param params - Parameters to match against (section, page, tab)
 *   - page may be underscore-separated for subsection pages (e.g., "forms_checkbox")
 * @returns Matching entry or null if not found
 */
export function findContentEntry(
  entries: EnrichedContentEntry[],
  params: ContentMatchParams
): EnrichedContentEntry | null {
  const { section, page, tab } = params

  const matchingEntry = entries.find((entry) => {
    // Match section and tab
    if (entry.data.section !== section) {
      return false
    }

    const entryTab = addDemosOrDeprecated(entry.data.tab, entry.filePath)
    if (entryTab !== tab) {
      return false
    }

    // Match page (handling flattened subsection names)
    const entryId = kebabCase(entry.data.id)
    const entryPage = entry.data.subsection
      ? `${entry.data.subsection}_${entryId}`
      : entryId

    return entryPage === page
  })

  return matchingEntry || null
}

/**
 * Finds the file path for a content entry matching the given parameters
 * Prefers .mdx files over .md files when both exist, since .mdx files
 * contain the LiveExample components and example imports
 *
 * @param entries - Array of enriched content entries to search
 * @param params - Parameters to match against (section, page, tab)
 *   - page may be underscore-separated for subsection pages (e.g., "forms_checkbox")
 * @returns The file path, or null if not found
 */
export function findContentEntryFilePath(
  entries: EnrichedContentEntry[],
  params: ContentMatchParams
): string | null {
  const { section, page, tab } = params

  // Find all matching entries
  const matchingEntries = entries.filter((entry) => {
    if (entry.data.section !== section) {
      return false
    }

    const entryTab = addDemosOrDeprecated(entry.data.tab, entry.filePath)
    if (entryTab !== tab) {
      return false
    }

    const entryId = kebabCase(entry.data.id)
    const entryPage = entry.data.subsection
      ? `${entry.data.subsection}_${entryId}`
      : entryId

    return entryPage === page
  })

  if (matchingEntries.length === 0) {
    return null
  }

  // Prefer .mdx over .md (mdx files contain LiveExample components)
  const mdxEntry = matchingEntries.find((entry) => entry.filePath.endsWith('.mdx'))
  const selectedEntry = mdxEntry || matchingEntries[0]

  return selectedEntry.filePath
}
