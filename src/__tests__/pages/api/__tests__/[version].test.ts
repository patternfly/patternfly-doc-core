import { GET } from '../../../../pages/api/[version]'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {
    v5: ['getting-started'],
    v6: ['components', 'layouts', 'utilities'],
  },
  pages: {},
  tabs: {},
}

it('returns all sections for a valid version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(Array.isArray(body)).toBe(true)
  expect(body).toContain('components')
  expect(body).toContain('layouts')
  expect(body).toContain('utilities')

  jest.restoreAllMocks()
})

it('returns only sections for the requested version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v5' },
    url: new URL('http://localhost:4321/api/v5'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toContain('getting-started')

  jest.restoreAllMocks()
})

it('sorts sections alphabetically', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6'),
  } as any)
  const body = await response.json()

  const sorted = [...body].sort()
  expect(body).toEqual(sorted)

  jest.restoreAllMocks()
})

it('deduplicates sections from multiple collections', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6'),
  } as any)
  const body = await response.json()

  const unique = [...new Set(body)]
  expect(body).toEqual(unique)

  jest.restoreAllMocks()
})

it('returns 404 error for nonexistent version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v99' },
    url: new URL('http://localhost:4321/api/v99'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 error when version parameter is missing', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: {},
    url: new URL('http://localhost:4321/api/'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})

it('returns sections array that matches the API index', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6'),
  } as any)
  const body = await response.json()

  // Verify the returned sections exactly match the indexed sections
  // The API index generation process filters out entries without section fields
  expect(body).toEqual(mockApiIndex.sections.v6)
  expect(body).toEqual(['components', 'layouts', 'utilities'])

  jest.restoreAllMocks()
})
