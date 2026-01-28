import { GET } from '../../../../../pages/api/[version]/tokens'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

jest.mock('../../../../../utils/tokens', () => ({
  getTokenCategories: jest.fn(() => [
    'c',
    'chart',
    'global',
    'hidden',
    'l',
    't',
  ]),
}))

it('returns sorted token categories for valid version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe(
    'application/json; charset=utf-8',
  )
  expect(Array.isArray(body)).toBe(true)
  expect(body).toEqual(['c', 'chart', 'global', 'hidden', 'l', 't'])

  jest.restoreAllMocks()
})

it('returns categories alphabetically sorted', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens'),
  } as any)
  const body = await response.json()

  const sorted = [...body].sort()
  expect(body).toEqual(sorted)

  jest.restoreAllMocks()
})

it('returns 404 error for nonexistent version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v99' },
    url: new URL('http://localhost:4321/api/v99/tokens'),
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
    } as Response),
  )

  const response = await GET({
    params: {},
    url: new URL('http://localhost:4321/api/tokens'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})
