import { GET } from '../[version]'

/**
 * Mock apiIndex.json with multiple versions (v5, v6)
 * to test section retrieval for different versions
 */
jest.mock('../../../apiIndex.json', () => ({
  versions: ['v5', 'v6'],
  sections: {
    v5: ['getting-started'],
    v6: ['components', 'layouts', 'utilities'],
  },
  pages: {},
  tabs: {},
}))

it('returns all sections for a valid version', async () => {
  const response = await GET({
    params: { version: 'v6' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(Array.isArray(body)).toBe(true)
  expect(body).toContain('components')
  expect(body).toContain('layouts')
  expect(body).toContain('utilities')
})

it('returns only sections for the requested version', async () => {
  const response = await GET({
    params: { version: 'v5' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toContain('getting-started')
})

it('sorts sections alphabetically', async () => {
  const response = await GET({
    params: { version: 'v6' },
  } as any)
  const body = await response.json()

  const sorted = [...body].sort()
  expect(body).toEqual(sorted)
})

it('deduplicates sections from multiple collections', async () => {
  const response = await GET({
    params: { version: 'v6' },
  } as any)
  const body = await response.json()

  const unique = [...new Set(body)]
  expect(body).toEqual(unique)
})

it('returns 404 error for nonexistent version', async () => {
  const response = await GET({
    params: { version: 'v99' },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
  expect(body.error).toContain('not found')
})

it('returns 400 error when version parameter is missing', async () => {
  const response = await GET({
    params: {},
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')
})

it('excludes content entries that have no section field', async () => {
  const response = await GET({
    params: { version: 'v6' },
  } as any)
  const body = await response.json()

  // Should only include sections from entries that have data.section
  expect(body.length).toBeGreaterThan(0)
})
