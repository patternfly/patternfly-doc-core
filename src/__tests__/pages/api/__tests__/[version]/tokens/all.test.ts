import { GET } from '../../../../../../pages/api/[version]/tokens/all'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockTokensByCategory = {
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
  chart: [
    {
      name: '--pf-v6-chart-global--Color',
      value: '#666',
      var: 'var(--pf-v6-chart-global--Color)',
    },
  ],
}

jest.mock('../../../../../../utils/tokens', () => ({
  getTokensByCategory: jest.fn(() => mockTokensByCategory),
  filterTokensByCategory: jest.fn((byCategory, filter) => {
    const filtered: any = {}
    for (const [category, tokens] of Object.entries(byCategory)) {
      const filteredTokens = (tokens as any[]).filter((token: any) =>
        token.name.toLowerCase().includes(filter.toLowerCase()),
      )
      if (filteredTokens.length > 0) {
        filtered[category] = filteredTokens
      }
    }
    return filtered
  }),
}))

it('returns all tokens grouped by category', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens/all'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe(
    'application/json; charset=utf-8',
  )
  expect(typeof body).toBe('object')
  expect(body).toHaveProperty('c')
  expect(body).toHaveProperty('t')
  expect(body).toHaveProperty('chart')
  expect(Array.isArray(body.c)).toBe(true)
  expect(body.c).toHaveLength(2)
  expect(body.t).toHaveLength(1)

  jest.restoreAllMocks()
})

it('filters tokens across all categories when filter parameter is provided', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens/all?filter=alert'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body).toHaveProperty('c')
  expect(body.c).toHaveLength(1)
  expect(body.c[0].name).toContain('alert')
  expect(body).not.toHaveProperty('t')
  expect(body).not.toHaveProperty('chart')

  jest.restoreAllMocks()
})

it('returns empty object when filter yields no matches', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens/all?filter=nonexistent'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(typeof body).toBe('object')
  expect(Object.keys(body)).toHaveLength(0)

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
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens/all?filter=GLOBAL'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(typeof body).toBe('object')
  expect(Object.keys(body).length).toBeGreaterThan(0)

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
    url: new URL('http://localhost:4321/api/v99/tokens/all'),
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
    url: new URL('http://localhost:4321/api/tokens/all'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})

it('each token has required properties', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/tokens/all'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_category, tokens] of Object.entries(body)) {
    expect(Array.isArray(tokens)).toBe(true)
    for (const token of tokens as any[]) {
      expect(token).toHaveProperty('name')
      expect(token).toHaveProperty('value')
      expect(token).toHaveProperty('var')
      expect(typeof token.name).toBe('string')
      expect(typeof token.value).toBe('string')
      expect(typeof token.var).toBe('string')
    }
  }

  jest.restoreAllMocks()
})
