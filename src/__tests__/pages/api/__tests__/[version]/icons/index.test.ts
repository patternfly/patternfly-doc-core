import { GET } from '../../../../../../pages/api/[version]/icons/index'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockIcons = [
  {
    name: 'circle',
    reactName: 'CircleIcon',
    usage: "import { CircleIcon } from '@patternfly/react-icons'",
  },
  {
    name: 'home',
    reactName: 'HomeIcon',
    usage: "import { HomeIcon } from '@patternfly/react-icons'",
  },
  {
    name: 'circle-outline',
    reactName: 'CircleOutlineIcon',
    usage: "import { CircleOutlineIcon } from '@patternfly/react-icons'",
  },
]

function createFetchMock(): typeof fetch {
  return jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    const json = () =>
      Promise.resolve(
        url.includes('iconsIndex.json') ? { icons: mockIcons } : mockApiIndex
      )
    return Promise.resolve({ ok: true, json } as Response)
  }) as typeof fetch
}

jest.mock('../../../../../../utils/icons/reactIcons', () => ({
  filterIcons: jest.fn((icons: typeof mockIcons, filter: string) => {
    if (!filter || !filter.trim()) {
      return icons
    }
    const term = filter.toLowerCase().trim()
    return icons.filter(
      (icon: (typeof mockIcons)[0]) =>
        icon.name.toLowerCase().includes(term) ||
        icon.reactName.toLowerCase().includes(term),
    )
  }),
}))

it('returns all icons with metadata', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe(
    'application/json; charset=utf-8',
  )
  expect(body).toHaveProperty('icons')
  expect(body).toHaveProperty('total')
  expect(Array.isArray(body.icons)).toBe(true)
  expect(body.icons).toHaveLength(3)
  expect(body.total).toBe(3)
  expect(body.icons[0]).toHaveProperty('name')
  expect(body.icons[0]).toHaveProperty('reactName')
  expect(body.icons[0]).toHaveProperty('usage')

  jest.restoreAllMocks()
})

it('filters icons when filter parameter is provided', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons?filter=circle'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.icons).toHaveLength(2)
  expect(body.total).toBe(2)
  expect(body.filter).toBe('circle')
  expect(body.icons.every((i: { name: string }) => i.name.includes('circle'))).toBe(true)

  jest.restoreAllMocks()
})

it('filter is case-insensitive', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons?filter=CIRCLE'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.icons.length).toBeGreaterThan(0)

  jest.restoreAllMocks()
})

it('returns empty icons array when filter yields no matches', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons?filter=nonexistent'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.icons).toHaveLength(0)
  expect(body.total).toBe(0)

  jest.restoreAllMocks()
})

it('returns 404 error for nonexistent version', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: { version: 'v99' },
    url: new URL('http://localhost:4321/api/v99/icons'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 error when version parameter is missing', async () => {
  global.fetch = createFetchMock()

  const response = await GET({
    params: {},
    url: new URL('http://localhost:4321/api/icons'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})

it('returns 500 error when fetchIconsIndex throws', async () => {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.includes('iconsIndex.json')) {
      return Promise.resolve({ ok: false, status: 500, statusText: 'Internal Server Error' } as Response)
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response)
  }) as typeof fetch

  const response = await GET({
    params: { version: 'v6' },
    url: new URL('http://localhost:4321/api/v6/icons'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Failed to load icons')
  expect(body).toHaveProperty('details')

  jest.restoreAllMocks()
})
