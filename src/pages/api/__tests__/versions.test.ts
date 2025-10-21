import { GET } from '../versions'

/**
 * Mock content with multiple collections at different versions
 * to test version filtering and deduplication
 */
jest.mock('../../../content', () => ({
  content: [
    { name: 'test1', version: 'v6' },
    { name: 'test2', version: 'v6' },
    { name: 'test3', version: 'v5' },
  ],
}))

it('returns unique versions as sorted array', async () => {
  const response = await GET({} as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(body).toEqual(['v5', 'v6'])
})

it('sorts versions alphabetically', async () => {
  const response = await GET({} as any)
  const body = await response.json()

  expect(body).toEqual(['v5', 'v6'])
})

it('excludes content entries that have no version', async () => {
  // Re-mock with entries that have null/undefined versions
  jest.resetModules()
  jest.mock('../../../content', () => ({
    content: [
      { name: 'test1', version: 'v6' },
      { name: 'test2', version: null },
      { name: 'test3', version: undefined },
    ],
  }))

  const { GET } = jest.requireActual('../versions')
  const response = await GET({} as any)
  const body = await response.json()

  expect(body).toEqual(['v6'])
})
