import { GET } from '../../../../../../pages/api/[version]/tokens/[category]'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockTokens = {
  c: [
    {
      name: '--pf-v6-c-alert--Color',
      value: '#000',
      var: 'var(--pf-v6-c-alert--Color)',
    },
    {
      name: '--pf-v6-c-button--Color',
      value: '#fff',
      var: 'var(--pf-v6-c-button--Color)',
    },
  ],
  t: [
    {
      name: '--pf-v6-t-global--Color',
      value: '#333',
      var: 'var(--pf-v6-t-global--Color)',
    },
  ],
}

jest.mock('../../../../../../utils/tokens', () => ({
  getTokenCategories: jest.fn(() => ['c', 't']),
  getTokensForCategory: jest.fn(
    (category: string) => mockTokens[category as keyof typeof mockTokens],
  ),
  filterTokens: jest.fn((tokens, filter) =>
    tokens.filter((token: any) =>
      token.name.toLowerCase().includes(filter.toLowerCase()),
    ),
  ),
}))

it('returns tokens for valid category', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', category: 'c' },
    url: new URL('http://localhost:4321/api/v6/tokens/c'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe(
    'application/json; charset=utf-8',
  )
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(2)
  expect(body[0]).toHaveProperty('name')
  expect(body[0]).toHaveProperty('value')
  expect(body[0]).toHaveProperty('var')

  jest.restoreAllMocks()
})

it('filters tokens when filter parameter is provided', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', category: 'c' },
    url: new URL('http://localhost:4321/api/v6/tokens/c?filter=alert'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(1)
  expect(body[0].name).toContain('alert')

  jest.restoreAllMocks()
})

it('returns empty array when filter yields no matches', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', category: 'c' },
    url: new URL('http://localhost:4321/api/v6/tokens/c?filter=nonexistent'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(0)

  jest.restoreAllMocks()
})

it('returns 404 error for invalid category with valid categories list', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', category: 'invalid' },
    url: new URL('http://localhost:4321/api/v6/tokens/invalid'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('invalid')
  expect(body.error).toContain('not found')
  expect(body).toHaveProperty('validCategories')
  expect(Array.isArray(body.validCategories)).toBe(true)
  expect(body.validCategories).toContain('c')
  expect(body.validCategories).toContain('t')

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
    params: { version: 'v99', category: 'c' },
    url: new URL('http://localhost:4321/api/v99/tokens/c'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')

  jest.restoreAllMocks()
})

it('returns 400 error when parameters are missing', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: {},
    url: new URL('http://localhost:4321/api/tokens/'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')

  jest.restoreAllMocks()
})

it('filter is case-insensitive', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', category: 'c' },
    url: new URL('http://localhost:4321/api/v6/tokens/c?filter=ALERT'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(1)

  jest.restoreAllMocks()
})
