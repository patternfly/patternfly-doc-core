import { GET } from '../../[version]/[section]'

/**
 * Mock content collections with pages across different sections
 * to test section filtering and page aggregation
 */
jest.mock('../../../../content', () => {
  const { mockContentCollections } = jest.requireActual('../testHelpers')
  return { content: mockContentCollections.v6Extended }
})

/**
 * Mock getCollection to return pages with different sections
 * simulating component, layout, and utility pages
 */
jest.mock('astro:content', () => {
  const { createGetCollectionMock } = jest.requireActual('../testHelpers')
  return {
    getCollection: createGetCollectionMock({
      'react-component-docs': [
        { data: { section: 'components', id: 'Alert' } },
        { data: { section: 'components', id: 'Button' } },
        { data: { section: 'layouts', id: 'Grid' } },
      ],
      'core-docs': [
        { data: { section: 'components', id: 'Badge' } },
        { data: { section: 'utilities', id: 'Spacing' } },
      ],
      'quickstarts-docs': [
        { data: { section: 'getting-started', id: 'Intro' } },
      ],
    }),
  }
})

/**
 * Mock kebabCase utility to convert page IDs to URL-friendly format
 */
jest.mock('../../../../utils', () => {
  const { mockUtils } = jest.requireActual('../testHelpers')
  return { kebabCase: mockUtils.kebabCase }
})

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns all pages within a section', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json')
  expect(Array.isArray(body)).toBe(true)
  expect(body).toContain('alert')
  expect(body).toContain('button')
  expect(body).toContain('badge')
})

it('formats page IDs as kebab-case', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
  } as any)
  const body = await response.json()

  // All page IDs should be kebab-cased
  body.forEach((pageId: string) => {
    expect(pageId).toBe(pageId.toLowerCase())
    expect(pageId).not.toContain(' ')
  })
})

it('sorts pages alphabetically', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
  } as any)
  const body = await response.json()

  const sorted = [...body].sort()
  expect(body).toEqual(sorted)
})

it('deduplicates page IDs from multiple collections', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
  } as any)
  const body = await response.json()

  const unique = [...new Set(body)]
  expect(body).toEqual(unique)
})

it('returns 404 error for nonexistent version', async () => {
  const response = await GET({
    params: { version: 'v99', section: 'components' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
})

it('returns 404 error for nonexistent section', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'nonexistent' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 400 error when required parameters are missing', async () => {
  const response = await GET({
    params: { version: 'v6' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')
})

it('filters pages to only the specified section', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'layouts' },
  } as any)
  const body = await response.json()

  expect(body).toContain('grid')
  expect(body).not.toContain('alert')
  expect(body).not.toContain('button')
})
