/* eslint-disable no-console */
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { getCollection } from 'astro:content'
import type { CollectionKey } from 'astro:content'
import { content } from '../../content'
import { kebabCase, addDemosOrDeprecated } from '../index'
import { getDefaultTabForApi } from '../packageUtils'
import { getOutputDir } from '../getOutputDir'

const SOURCE_ORDER: Record<string, number> = {
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
  const s1Index = SOURCE_ORDER[s1] || 50
  const s2Index = SOURCE_ORDER[s2] || 50
  if (s1Index === 50 && s2Index === 50) {
    return s1.localeCompare(s2)
  }
  return s1Index > s2Index ? 1 : -1
}

/**
 * Structure of the API index used for routing and navigation
 * Keys in sections/pages/tabs use '::' separator (e.g., 'v6::components::alert')
 */
export interface ApiIndex {
  /** Available documentation versions (e.g., ['v5', 'v6']) */
  versions: string[]
  /** Sections by version (e.g., { 'v6': ['components', 'layouts'] }) */
  sections: Record<string, string[]>
  /** Pages by version::section (e.g., { 'v6::components': ['alert', 'button'] }) */
  pages: Record<string, string[]>
  /** Tabs by version::section::page (e.g., { 'v6::components::alert': ['react', 'html'] }) */
  tabs: Record<string, string[]>
  /** Examples by version::section::page::tab with titles (e.g., { 'v6::components::alert::react': [{exampleName: 'AlertDefault', title: 'Default alert'}] }) */
  examples: Record<string, { exampleName: string; title: string | null }[]>
}

/**
 * Extracts examples with titles from markdown/MDX content
 * Looks for <LiveExample src={ExampleName} /> patterns and finds associated H3 titles
 *
 * @param body - The raw markdown/MDX text content
 * @returns Array of unique examples with titles in document order
 */
function extractExamplesWithTitles(
  body: string
): { exampleName: string; title: string | null }[] {
  if (!body) {
    return []
  }

  // Match <LiveExample> tags with src attribute containing an example name
  // Supports various attribute orders and spacing patterns
  const exampleRegex = /<LiveExample[^>]*\ssrc=\{\s*(\w+)\s*\}[^>]*\/?>/g
  const examples: { exampleName: string; title: string | null }[] = []
  const seen = new Set<string>()
  let match

  // Find all examples and their positions
  while ((match = exampleRegex.exec(body)) !== null) {
    const exampleName = match[1]
    if (exampleName && !seen.has(exampleName)) {
      seen.add(exampleName)

      // Find the most recent h3 before this example
      const textBeforeExample = body.substring(0, match.index)
      const h3Matches = [...textBeforeExample.matchAll(/^### (.+)$/gm)]
      const title = h3Matches.length > 0 ? h3Matches[h3Matches.length - 1][1].trim() : null

      examples.push({ exampleName, title })
    }
  }

  return examples
}

/**
 * Generates API index by analyzing all content collections
 * Extracts versions, sections, pages, and tabs into a hierarchical structure
 * This runs during build time when getCollection() is available
 *
 * @returns Promise resolving to complete API index structure
 */
export async function generateApiIndex(): Promise<ApiIndex> {
  console.log('Generating API index from content collections...')

  const index: ApiIndex = {
    versions: [],
    sections: {},
    pages: {},
    tabs: {},
    examples: {},
  }

  // Get all versions
  const versionSet = new Set<string>()
  content.forEach((entry: any) => {
    if (entry.version) {
      versionSet.add(entry.version)
    }
  })
  index.versions = Array.from(versionSet).sort()

  // For each version, collect index data
  for (const version of versionSet) {
    const collectionsToFetch = content
      .filter((entry: any) => entry.version === version)
      .map((entry: any) => entry.name as CollectionKey)

    const collections = await Promise.all(
      collectionsToFetch.map((name) => getCollection(name)),
    )

    const flatEntries = collections.flat()

    // Collect sections, pages, and tabs in a single pass
    const sections = new Set<string>()
    const sectionPages: Record<string, Set<string>> = {}
    const pageTabs: Record<string, Set<string>> = {}
    const tabExamples: Record<string, { exampleName: string; title: string | null }[]> = {}

    flatEntries.forEach((entry: any) => {
      if (!entry.data.section) {
        return
      }

      const section = entry.data.section
      const page = kebabCase(entry.data.id)
      const sectionKey = `${version}::${section}`
      const pageKey = `${version}::${section}::${page}`

      // Collect section
      sections.add(section)

      // Collect page
      if (!sectionPages[sectionKey]) {
        sectionPages[sectionKey] = new Set()
      }
      sectionPages[sectionKey].add(page)

      // Collect tab
      const entryTab =
        entry.data.tab || entry.data.source || getDefaultTabForApi(entry.filePath)
      const tab = addDemosOrDeprecated(entryTab, entry.filePath)
      if (!pageTabs[pageKey]) {
        pageTabs[pageKey] = new Set()
      }
      pageTabs[pageKey].add(tab)

      // Collect examples for this tab
      const tabKey = `${version}::${section}::${page}::${tab}`
      const examplesWithTitles = extractExamplesWithTitles(entry.body || '')
      if (examplesWithTitles.length > 0) {
        tabExamples[tabKey] = examplesWithTitles
      }
    })

    // Convert sets to sorted arrays
    index.sections[version] = Array.from(sections).sort()

    Object.entries(sectionPages).forEach(([key, pages]) => {
      index.pages[key] = Array.from(pages).sort()
    })

    Object.entries(pageTabs).forEach(([key, tabs]) => {
      index.tabs[key] = Array.from(tabs).sort(sortSources)
    })

    Object.entries(tabExamples).forEach(([key, examples]) => {
      index.examples[key] = examples
    })
  }

  return index
}

/**
 * Writes API index to a apiIndex.json file in the user defined output directory
 * This file is used by server-side API routes to avoid runtime getCollection() calls
 *
 * @param index - The API index structure to write
 */
export async function writeApiIndex(index: ApiIndex): Promise<void> {
  const outputDir = await getOutputDir()
  const indexPath = join(outputDir, 'apiIndex.json')

  try {
    await mkdir(outputDir, { recursive: true })
    await writeFile(indexPath, JSON.stringify(index, null, 2))
    console.log(`✓ Generated API index with ${index.versions.length} versions`)
  } catch (error) {
    console.warn('Warning: Could not write API index file:', error)
  }
}

/**
 * Generates and writes API index in a single operation
 * Called during build in getStaticPaths to ensure index exists for server routes
 *
 * @returns Promise resolving to the generated API index
 */
export async function generateAndWriteApiIndex(): Promise<ApiIndex> {
  const index = await generateApiIndex()
  await writeApiIndex(index)
  return index
}
