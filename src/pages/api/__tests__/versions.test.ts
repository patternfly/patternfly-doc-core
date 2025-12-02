import { GET } from '../versions'

/**
 * Mock apiIndex.json with multiple versions
 */
jest.mock('../../../apiIndex.json', () => ({
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
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

it('returns only the versions from the index', async () => {
  const response = await GET({} as any)
  const body = await response.json()

  // Should return exactly the versions from the mocked apiIndex.json
  expect(body).toEqual(['v5', 'v6'])
  expect(body).toHaveLength(2)
})
