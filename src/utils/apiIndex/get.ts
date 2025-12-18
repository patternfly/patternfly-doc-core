import { join } from 'path'
import { readFile } from 'fs/promises'
import type { ApiIndex } from './generate'
import { getOutputDir } from '../getOutputDir'

/**
 * Reads and parses the API index file
 * Validates the structure and provides helpful error messages if file is missing or invalid
 *
 * @returns Promise resolving to the API index structure
 * @throws Error if index file is not found, contains invalid JSON, or has invalid structure
 */
export async function getApiIndex(): Promise<ApiIndex> {
  const outputDir = await getOutputDir()
  const indexPath = join(outputDir, 'apiIndex.json')

  try {
    const content = await readFile(indexPath, 'utf-8')
    const parsed = JSON.parse(content)

    // Validate index structure
    if (!parsed.versions || !Array.isArray(parsed.versions)) {
      throw new Error('Invalid API index structure: missing or invalid "versions" array')
    }

    if (!parsed.examples || typeof parsed.examples !== 'object') {
      throw new Error('Invalid API index structure: missing or invalid "examples" object')
    }

    return parsed as ApiIndex
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `API index file not found at ${indexPath}. ` +
        'Please run the build process to generate the index.'
      )
    }

    if (error instanceof SyntaxError) {
      throw new Error(
        `API index file contains invalid JSON at ${indexPath}. ` +
        'Please rebuild to regenerate the index file.'
      )
    }

    throw error
  }
}

/**
 * Gets all available documentation versions
 *
 * @returns Promise resolving to array of version strings (e.g., ['v5', 'v6'])
 */
export async function getVersions(): Promise<string[]> {
  const index = await getApiIndex()
  return index.versions
}

/**
 * Gets all sections for a specific version
 *
 * @param version - The documentation version (e.g., 'v6')
 * @returns Promise resolving to array of section names, or empty array if version not found
 */
export async function getSections(version: string): Promise<string[]> {
  const index = await getApiIndex()
  return index.sections[version] || []
}

/**
 * Gets all pages within a section for a specific version
 *
 * @param version - The documentation version (e.g., 'v6')
 * @param section - The section name (e.g., 'components')
 * @returns Promise resolving to array of page slugs, or empty array if not found
 */
export async function getPages(version: string, section: string): Promise<string[]> {
  const index = await getApiIndex()
  const { createIndexKey } = await import('../apiHelpers')
  const key = createIndexKey(version, section)
  return index.pages[key] || []
}

/**
 * Gets all tabs for a specific page
 *
 * @param version - The documentation version (e.g., 'v6')
 * @param section - The section name (e.g., 'components')
 * @param page - The page slug (e.g., 'alert')
 * @returns Promise resolving to array of tab names, or empty array if not found
 */
export async function getTabs(version: string, section: string, page: string): Promise<string[]> {
  const index = await getApiIndex()
  const { createIndexKey } = await import('../apiHelpers')
  const key = createIndexKey(version, section, page)
  return index.tabs[key] || []
}

/**
 * Gets all examples for a specific tab
 *
 * @param version - The documentation version (e.g., 'v6')
 * @param section - The section name (e.g., 'components')
 * @param page - The page slug (e.g., 'alert')
 * @param tab - The tab name (e.g., 'react')
 * @returns Promise resolving to array of examples with titles, or empty array if not found
 */
export async function getExamples(
  version: string,
  section: string,
  page: string,
  tab: string,
): Promise<Array<{ exampleName: string; title: string | null }>> {
  const index = await getApiIndex()
  const { createIndexKey } = await import('../apiHelpers')
  const key = createIndexKey(version, section, page, tab)
  return index.examples[key] || []
}
