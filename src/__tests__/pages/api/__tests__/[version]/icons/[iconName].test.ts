import { GET } from '../../../../../../pages/api/[version]/icons/[iconName]'

const mockApiIndex = {
  versions: ['v5', 'v6'],
  sections: {},
  pages: {},
  tabs: {},
}

const mockSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="200"/></svg>'

jest.mock('../../../../../../utils/icons/reactIcons', () => ({
  getIconSvg: jest.fn((setId: string, iconName: string) => {
    if (setId === 'fa' && iconName === 'FaCircle') {
      return Promise.resolve(mockSvg)
    }
    return Promise.resolve(null)
  }),
  parseIconId: jest.fn((iconId: string) => {
    const underscoreIndex = iconId.indexOf('_')
    if (underscoreIndex <= 0) {
      return null
    }
    const setId = iconId.slice(0, underscoreIndex)
    const iconName = iconId.slice(underscoreIndex + 1)
    if (!setId || !iconName) {
      return null
    }
    return { setId, iconName }
  }),
}))

it('returns SVG markup for valid icon', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', iconName: 'fa_FaCircle' },
    url: new URL('http://localhost:4321/api/v6/icons/fa_FaCircle'),
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

it('returns 404 when icon is not found in set', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', iconName: 'fa_FaNonExistent' },
    url: new URL('http://localhost:4321/api/v6/icons/fa_FaNonExistent'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('FaNonExistent')
  expect(body.error).toContain('fa')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 for invalid icon name format (no underscore)', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', iconName: 'invalid' },
    url: new URL('http://localhost:4321/api/v6/icons/invalid'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Invalid icon name format')
  expect(body).toHaveProperty('expected')
  expect(body.expected).toContain('fa_FaCircle')

  jest.restoreAllMocks()
})

it('returns 400 for invalid icon name format (leading underscore)', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', iconName: '_FaCircle' },
    url: new URL('http://localhost:4321/api/v6/icons/_FaCircle'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Invalid icon name format')

  jest.restoreAllMocks()
})

it('returns 400 when icon name parameter is missing', async () => {
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

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Icon name parameter is required')

  jest.restoreAllMocks()
})

it('returns 404 for nonexistent version', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { version: 'v99', iconName: 'fa_FaCircle' },
    url: new URL('http://localhost:4321/api/v99/icons/fa_FaCircle'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
  expect(body.error).toContain('not found')

  jest.restoreAllMocks()
})

it('returns 400 when version parameter is missing', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockApiIndex),
    } as Response),
  )

  const response = await GET({
    params: { iconName: 'fa_FaCircle' },
    url: new URL('http://localhost:4321/api/icons/fa_FaCircle'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version parameter is required')

  jest.restoreAllMocks()
})

it('returns 500 when fetchApiIndex fails', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response),
  )

  const response = await GET({
    params: { version: 'v6', iconName: 'fa_FaCircle' },
    url: new URL('http://localhost:4321/api/v6/icons/fa_FaCircle'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Failed to fetch API index')

  jest.restoreAllMocks()
})
