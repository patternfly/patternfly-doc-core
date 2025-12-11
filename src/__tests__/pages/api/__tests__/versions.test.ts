import { GET } from '../../../../pages/api/versions'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

it('returns unique versions as sorted array', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    url: new URL('http://localhost:4321/api/versions'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(body).toEqual(['v5', 'v6'])

  jest.restoreAllMocks()
})

it('sorts versions alphabetically', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    url: new URL('http://localhost:4321/api/versions'),
  } as any)
  const body = await response.json()

  expect(body).toEqual(['v5', 'v6'])

  jest.restoreAllMocks()
})

it('returns only the versions from the index', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  )

  const response = await GET({
    url: new URL('http://localhost:4321/api/versions'),
  } as any)
  const body = await response.json()

  // Should return exactly the versions from the mocked apiIndex.json
  expect(body).toEqual(['v5', 'v6'])
  expect(body).toHaveLength(2)

  jest.restoreAllMocks()
})
