import { GET } from '../../../../../../pages/api/[version]/icons/[iconName]'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="200"/></svg>'

const mockIconSvgs: Record<string, Record<string, string>> = {
  pf: { CircleIcon: mockSvg },
}

const mockIconsIndex = {
  icons: [
    { name: 'circle', reactName: 'CircleIcon', style: 'pf', usage: '', unicode: '', set: 'pf' },
  ],
}

function createFetchMock(): typeof fetch {
  return jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('/iconsIndex.json')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockIconsIndex),
      } as Response)
    }
    const match = url.match(/\/iconsSvgs\/([^/]+)\.json/)
    if (match) {
      const setId = match[1]
      const svgs = mockIconSvgs[setId] ?? {}
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(svgs),
      } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  }) as typeof fetch
}

it('returns SVG markup for valid icon', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6', iconName: 'CircleIcon' },
    url: new URL('http://localhost:4321/api/v6/icons/CircleIcon'),
  } as any)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe(
    'image/svg+xml; charset=utf-8',
  )
  expect(body).toBe(mockSvg)
  expect(body).toContain('<svg')

  jest.restoreAllMocks()
})

it('returns 404 when icon is not found', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6', iconName: 'NonExistentIcon' },
    url: new URL('http://localhost:4321/api/v6/icons/NonExistentIcon'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('NonExistentIcon')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 404 when icon name is not in index', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6', iconName: 'invalid' },
    url: new URL('http://localhost:4321/api/v6/icons/invalid'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('invalid')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 when icon name parameter is missing', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Icon name parameter is required')

  jest.restoreAllMocks()
})

it('returns 404 for nonexistent version', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v99', iconName: 'CircleIcon' },
    url: new URL('http://localhost:4321/api/v99/icons/CircleIcon'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 when version parameter is missing', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { iconName: 'CircleIcon' },
    url: new URL('http://localhost:4321/api/icons/CircleIcon'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})

it('returns 500 when fetchApiIndex fails', async () => {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('apiIndex.json')) {
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response)
  }) as typeof fetch

  const response = await GET({
    params: { version: 'v6', iconName: 'CircleIcon' },
    url: new URL('http://localhost:4321/api/v6/icons/CircleIcon'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Failed to fetch API index')

  jest.restoreAllMocks()
})
