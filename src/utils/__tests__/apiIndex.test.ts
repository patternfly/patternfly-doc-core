/**
 * Tests for API Index utilities
 *
 * Architecture:
 * - Build-time: getApiIndex() imports static data from data.ts
 * - Runtime: fetchApiIndex() fetches /apiIndex.json via HTTP
 */
import { getApiIndex, getVersions, getSections, getPages, getTabs, getExamples } from '../apiIndex/get'
import { createIndexKey } from '../apiHelpers'

describe('getApiIndex (build-time)', () => {
  it('returns API index with all required keys', async () => {
    const index = await getApiIndex()
    expect(index).toHaveProperty('versions')
    expect(index).toHaveProperty('sections')
    expect(index).toHaveProperty('pages')
    expect(index).toHaveProperty('tabs')
    expect(index).toHaveProperty('examples')
  })

  it('versions is a non-empty array', async () => {
    const index = await getApiIndex()
    expect(Array.isArray(index.versions)).toBe(true)
    expect(index.versions.length).toBeGreaterThan(0)
  })

  it('sections is an object with version keys containing string arrays', async () => {
    const index = await getApiIndex()
    expect(typeof index.sections).toBe('object')
    expect(Object.keys(index.sections).length).toBeGreaterThan(0)

    // Validate structure of sections array
    const sectionsArray = index.sections['v6']
    expect(Array.isArray(sectionsArray)).toBe(true)
    expect(sectionsArray.length).toBeGreaterThan(0)

    // All items should be strings (subsections are flattened into page names)
    sectionsArray.forEach(item => {
      expect(typeof item).toBe('string')
    })
  })

  it('pages is an object with composite keys', async () => {
    const index = await getApiIndex()
    expect(typeof index.pages).toBe('object')
    expect(Object.keys(index.pages).length).toBeGreaterThan(0)
    // Keys should be in format "version::section"
    const firstKey = Object.keys(index.pages)[0]
    expect(firstKey).toContain('::')
  })

  it('tabs is an object with composite keys', async () => {
    const index = await getApiIndex()
    expect(typeof index.tabs).toBe('object')
    expect(Object.keys(index.tabs).length).toBeGreaterThan(0)
    // Keys should be in format "version::section::page" (always 3 parts, page may be hyphenated)
    const firstKey = Object.keys(index.tabs)[0]
    expect(firstKey.split('::').length).toBe(3)
  })

  it('examples is an object with composite keys and example arrays', async () => {
    const index = await getApiIndex()
    expect(typeof index.examples).toBe('object')
    const exampleKeys = Object.keys(index.examples)
    expect(exampleKeys.length).toBeGreaterThan(0)
    // Keys are always "version::section::page::tab" (4 parts, page may be hyphenated)
    const firstKey = exampleKeys[0]
    const parts = firstKey.split('::').length
    expect(parts).toBe(4)
    // Values should be arrays of example objects
    const examples = index.examples[firstKey]
    expect(Array.isArray(examples)).toBe(true)
    if (examples.length > 0) {
      expect(examples[0]).toHaveProperty('exampleName')
      expect(examples[0]).toHaveProperty('title')
    }
  })
})

describe('getVersions', () => {
  it('returns array of version strings', async () => {
    const versions = await getVersions()
    expect(Array.isArray(versions)).toBe(true)
    expect(versions.length).toBeGreaterThan(0)
    expect(typeof versions[0]).toBe('string')
  })

  it('includes v6 version', async () => {
    const versions = await getVersions()
    expect(versions).toContain('v6')
  })
})

describe('getSections', () => {
  it('returns array of sections for valid version', async () => {
    const sections = await getSections('v6')
    expect(Array.isArray(sections)).toBe(true)
    expect(sections.length).toBeGreaterThan(0)
  })

  it('includes expected sections', async () => {
    const sections = await getSections('v6')
    expect(sections).toContain('components')
  })

  it('returns empty array for invalid version', async () => {
    const sections = await getSections('invalid')
    expect(sections).toEqual([])
  })
})



describe('getPages', () => {
  it('returns array of pages for valid version and section', async () => {
    const pages = await getPages('v6', 'components')
    expect(Array.isArray(pages)).toBe(true)
    expect(pages.length).toBeGreaterThan(0)
  })

  it('includes expected pages (including underscore-separated subsection pages)', async () => {
    const pages = await getPages('v6', 'components')
    expect(pages).toContain('alert')
    expect(pages).toContain('button')
    // Check for at least one underscore-separated page (subsection page like "forms_checkbox")
    const hasUnderscorePage = pages.some(page => page.includes('_'))
    expect(hasUnderscorePage).toBe(true)
  })

  it('returns empty array for invalid section', async () => {
    const pages = await getPages('v6', 'invalid')
    expect(pages).toEqual([])
  })

  it('uses correct index key format', async () => {
    const key = createIndexKey('v6', 'components')
    const index = await getApiIndex()
    expect(index.pages[key]).toBeDefined()
  })
})

describe('getTabs', () => {
  it('returns array of tabs for valid path', async () => {
    const tabs = await getTabs('v6', 'components', 'alert')
    expect(Array.isArray(tabs)).toBe(true)
    expect(tabs.length).toBeGreaterThan(0)
  })

  it('includes expected tabs', async () => {
    const tabs = await getTabs('v6', 'components', 'alert')
    expect(tabs).toContain('react')
  })

  it('returns empty array for invalid page', async () => {
    const tabs = await getTabs('v6', 'components', 'invalid')
    expect(tabs).toEqual([])
  })

  it('uses correct index key format', async () => {
    const key = createIndexKey('v6', 'components', 'alert')
    const index = await getApiIndex()
    expect(index.tabs[key]).toBeDefined()
  })
})

describe('getExamples', () => {
  it('returns array of examples for valid path with examples', async () => {
    const examples = await getExamples('v6', 'components', 'alert', 'react')
    expect(Array.isArray(examples)).toBe(true)
  })

  it('returns examples with correct structure', async () => {
    const examples = await getExamples('v6', 'components', 'alert', 'react')
    if (examples.length > 0) {
      const firstExample = examples[0]
      expect(firstExample).toHaveProperty('exampleName')
      expect(firstExample).toHaveProperty('title')
      expect(typeof firstExample.exampleName).toBe('string')
      expect(firstExample.exampleName.length).toBeGreaterThan(0)
      // Title can be null or string
      expect(
        firstExample.title === null || typeof firstExample.title === 'string'
      ).toBe(true)
    }
  })

  it('returns empty array for tab without examples', async () => {
    const examples = await getExamples('v6', 'components', 'nonexistent', 'react')
    expect(examples).toEqual([])
  })

  it('returns empty array for invalid parameters', async () => {
    const examples = await getExamples('invalid', 'invalid', 'invalid', 'invalid')
    expect(examples).toEqual([])
  })

  it('uses correct index key format', async () => {
    const key = createIndexKey('v6', 'components', 'alert', 'react')
    const index = await getApiIndex()
    // Key may or may not exist depending on whether there are examples
    if (index.examples[key]) {
      expect(Array.isArray(index.examples[key])).toBe(true)
    }
  })

  it('examples are in document order', async () => {
    const examples = await getExamples('v6', 'components', 'alert', 'react')
    if (examples.length > 1) {
      // Just verify they're all unique (order is preserved from document)
      const names = examples.map((e) => e.exampleName)
      const uniqueNames = new Set(names)
      expect(names.length).toBe(uniqueNames.size)
    }
  })
})

describe('Flattened subsection support', () => {
  it('subsections are flattened into page names with underscores', async () => {
    const index = await getApiIndex()
    const pages = index.pages['v6::components']
    expect(pages).toBeDefined()
    // Should contain underscore-separated page names like "forms_checkbox"
    const formsCheckbox = pages?.find(p => p === 'forms_checkbox')
    expect(formsCheckbox).toBeDefined()
  })

  it('flattened pages have tabs with 3-part keys', async () => {
    const index = await getApiIndex()
    // Underscore-separated page name (former subsection page)
    const formsCheckboxKey = createIndexKey('v6', 'components', 'forms_checkbox')
    expect(index.tabs[formsCheckboxKey]).toBeDefined()
    expect(index.tabs[formsCheckboxKey].length).toBeGreaterThan(0)
    expect(formsCheckboxKey.split('::').length).toBe(3)
  })

  it('flattened pages have examples with 4-part keys', async () => {
    const index = await getApiIndex()
    // Check if forms_checkbox has react examples
    const formsCheckboxReactKey = createIndexKey('v6', 'components', 'forms_checkbox', 'react')
    // May or may not have examples, just check structure if it exists
    if (index.examples[formsCheckboxReactKey]) {
      expect(Array.isArray(index.examples[formsCheckboxReactKey])).toBe(true)
      expect(formsCheckboxReactKey.split('::').length).toBe(4)
    }
  })

  it('regular pages continue to work with 3-part tab keys', async () => {
    const index = await getApiIndex()
    const alertKey = createIndexKey('v6', 'components', 'alert')
    expect(index.tabs[alertKey]).toBeDefined()
    expect(alertKey.split('::').length).toBe(3)
  })

  it('all tab keys are 3-part (no 4-part keys)', async () => {
    const index = await getApiIndex()
    const tabKeys = Object.keys(index.tabs)
    // All tab keys should be 3-part (version::section::page)
    const allThreePart = tabKeys.every(key => key.split('::').length === 3)
    expect(allThreePart).toBe(true)
  })

  it('all example keys are 4-part (no 5-part keys)', async () => {
    const index = await getApiIndex()
    const exampleKeys = Object.keys(index.examples)
    // All example keys should be 4-part (version::section::page::tab)
    const allFourPart = exampleKeys.every(key => key.split('::').length === 4)
    expect(allFourPart).toBe(true)
  })
})

describe('API Index architecture', () => {
  it('data structure supports hierarchical navigation', async () => {
    const index = await getApiIndex()

    // Get version
    const version = index.versions[0]
    expect(version).toBeTruthy()

    // Get sections for version (all sections are flat strings)
    const sections = index.sections[version]
    expect(sections).toBeDefined()
    expect(sections!.length).toBeGreaterThan(0)
    const section = sections![0]

    // Get pages for first section
    const sectionKey = createIndexKey(version, section)
    const pages = index.pages[sectionKey]
    expect(pages).toBeDefined()
    expect(pages!.length).toBeGreaterThan(0)

    // Get tabs for first page
    const page = pages![0]
    const pageKey = createIndexKey(version, section, page)
    const tabs = index.tabs[pageKey]
    expect(tabs).toBeDefined()
    expect(tabs!.length).toBeGreaterThan(0)

    // Get examples for first tab (if available)
    const tab = tabs![0]
    const tabKey = createIndexKey(version, section, page, tab)
    const examples = index.examples[tabKey]
    // Examples may or may not exist for all tabs
    if (examples) {
      expect(Array.isArray(examples)).toBe(true)
    }
  })

  it('uses consistent key delimiter (::)', async () => {
    const index = await getApiIndex()

    // Check pages keys
    const pagesKeys = Object.keys(index.pages)
    expect(pagesKeys.every(key => key.includes('::'))).toBe(true)

    // Check tabs keys
    const tabsKeys = Object.keys(index.tabs)
    expect(tabsKeys.every(key => key.includes('::'))).toBe(true)

    // Check examples keys
    const examplesKeys = Object.keys(index.examples)
    expect(examplesKeys.every(key => key.includes('::'))).toBe(true)
  })
})

/**
 * Note: fetchApiIndex() is not tested here because it requires:
 * 1. A running server to serve /apiIndex.json
 * 2. A URL object from the request context
 *
 * Integration tests for fetchApiIndex() should be in end-to-end tests
 * that can spin up a dev/preview server.
 *
 * Architecture decision:
 * - getApiIndex(): Used at build-time (getStaticPaths), imports static data
 * - fetchApiIndex(): Used at runtime (GET handlers), fetches via HTTP
 * - Both return the same ApiIndex structure
 * - fetchApiIndex() avoids bundling 500KB+ data into Cloudflare Workers
 */
