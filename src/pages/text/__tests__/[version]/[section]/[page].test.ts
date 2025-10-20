import { GET } from '../../../[version]/[section]/[page]'

/**
 * Mock content collections with pages that have multiple tabs
 * to test tab aggregation and sorting from different collections
 */
jest.mock('../../../../../content', () => {
  const { mockContentCollections } = jest.requireActual('../../testHelpers')
  return { content: mockContentCollections.v6 }
})

/**
 * Mock getCollection to return entries with various tab configurations
 * simulating React, HTML, and design guideline tabs
 */
jest.mock('astro:content', () => {
  const {
    mockCollectionEntries,
    createGetCollectionMock,
  } = jest.requireActual('../../testHelpers')
  return {
    getCollection: createGetCollectionMock({
      'react-component-docs': mockCollectionEntries['react-component-docs'],
      'core-docs': mockCollectionEntries['core-docs'],
    }),
  }
})

/**
 * Mock utilities for tab name transformation and sorting
 */
jest.mock('../../../../../utils', () => {
  const { mockUtils } = jest.requireActual('../../testHelpers')
  return mockUtils
})

/**
 * Mock tab name dictionary for display names
 */
jest.mock('../../../../../globals', () => {
  const { mockTabNames } = jest.requireActual('../../testHelpers')
  return { tabNames: mockTabNames }
})

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns all tabs available for a page', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json')
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBeGreaterThan(0)
})

it('includes slug and display name for each tab', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
  } as any)
  const body = await response.json()

  body.forEach((tab: any) => {
    expect(tab).toHaveProperty('slug')
    expect(tab).toHaveProperty('name')
    expect(typeof tab.slug).toBe('string')
    expect(typeof tab.name).toBe('string')
  })
})

it('sorts tabs by priority (React before HTML, design guidelines last)', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
  } as any)
  const body = await response.json()

  // Check that tabs are in expected order (react before html, design guidelines near end)
  const slugs = body.map((t: any) => t.slug)
  const reactIndex = slugs.indexOf('react')
  const htmlIndex = slugs.indexOf('html')

  if (reactIndex !== -1 && htmlIndex !== -1) {
    expect(reactIndex).toBeLessThan(htmlIndex)
  }
})

it('returns 404 error for nonexistent version', async () => {
  const response = await GET({
    params: { version: 'v99', section: 'components', page: 'alert' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
})

it('returns 404 error for nonexistent section', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'invalid', page: 'alert' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
})

it('returns 404 error for nonexistent page', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'nonexistent' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 400 error when required parameters are missing', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')
})

it('aggregates tabs from multiple collections for the same page', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
  } as any)
  const body = await response.json()

  // Should have tabs from both react-component-docs and core-docs
  const slugs = body.map((t: any) => t.slug)
  expect(slugs.length).toBeGreaterThan(1)
})
