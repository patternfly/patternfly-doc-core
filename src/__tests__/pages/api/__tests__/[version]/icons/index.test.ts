import { GET } from '../../../../../../pages/api/[version]/icons/index'
import { getAllIcons } from '../../../../../../utils/icons/reactIcons'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockIcons = [
  {
    name: 'circle',
    reactName: 'FaCircle',
    style: 'solid',
    usage: "import { FaCircle } from 'react-icons/fa'",
    unicode: '',
    set: 'fa',
  },
  {
    name: 'home',
    reactName: 'MdHome',
    style: 'md',
    usage: "import { MdHome } from 'react-icons/md'",
    unicode: '',
    set: 'md',
  },
  {
    name: 'circle-outline',
    reactName: 'FaRegCircle',
    style: 'regular',
    usage: "import { FaRegCircle } from 'react-icons/fa'",
    unicode: '',
    set: 'fa',
  },
]

jest.mock('../../../../../../utils/icons/reactIcons', () => ({
  getAllIcons: jest.fn(() => Promise.resolve(mockIcons)),
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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
  expect(body.icons[0]).toHaveProperty('style')
  expect(body.icons[0]).toHaveProperty('usage')
  expect(body.icons[0]).toHaveProperty('unicode')

  jest.restoreAllMocks()
})

it('filters icons when filter parameter is provided', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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

it('returns 500 error when getAllIcons throws', async () => {
  ;(getAllIcons as jest.Mock).mockRejectedValueOnce(new Error('Load failed'))

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

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
