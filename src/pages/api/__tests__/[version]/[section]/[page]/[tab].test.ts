import { GET } from '../../../../[version]/[section]/[page]/[tab]'

/**
 * Mock content collections with entries that have body content
 * to test markdown/MDX content retrieval
 */
jest.mock('../../../../../../content', () => {
  const { mockContentCollections } = jest.requireActual('../../../testHelpers')
  return { content: mockContentCollections.v6 }
})

/**
 * Mock getCollection to return entries with body (markdown content)
 * simulating real documentation pages with content
 */
jest.mock('astro:content', () => {
  const { mockEntriesWithBody, createGetCollectionMock } = jest.requireActual(
    '../../../testHelpers',
  )
  return {
    getCollection: createGetCollectionMock({
      'react-component-docs': mockEntriesWithBody['react-component-docs'],
      'core-docs': mockEntriesWithBody['core-docs'],
    }),
  }
})

/**
 * Mock utilities for tab identification and transformation
 */
jest.mock('../../../../../../utils', () => {
  const { mockUtils } = jest.requireActual('../../../testHelpers')
  return mockUtils
})

/**
 * Mock API index to validate paths
 */
jest.mock('../../../../../../utils/apiIndex/get', () => ({
  getApiIndex: jest.fn().mockResolvedValue({
    versions: ['v6'],
    sections: {
      v6: ['components'],
    },
    pages: {
      'v6::components': ['alert'],
    },
    tabs: {
      'v6::components::alert': ['react', 'html', 'react-demos'],
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns markdown/MDX content as plain text', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  expect(typeof body).toBe('string')
  expect(body).toContain('Alert Component')
})

it('returns different content for different tabs', async () => {
  const reactResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const reactBody = await reactResponse.text()

  const htmlResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'html',
    },
  } as any)
  const htmlBody = await htmlResponse.text()

  expect(reactBody).toContain('React Alert')
  expect(htmlBody).toContain('HTML')
  expect(reactBody).not.toEqual(htmlBody)
})

it('returns demo content for demos tabs', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react-demos',
    },
  } as any)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(body).toContain('demos')
})

it('returns 404 error for nonexistent version', async () => {
  const response = await GET({
    params: {
      version: 'v99',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
})

it('returns 404 error for nonexistent section', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'invalid',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
})

it('returns 404 error for nonexistent page', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'nonexistent',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 404 error for nonexistent tab', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'nonexistent',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 400 error when required parameters are missing', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')
})
