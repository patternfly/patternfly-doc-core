import { GET } from '../../../../../../../pages/api/[version]/[section]/[page]/css'

/**
 * Mock fetchApiIndex to return API index with CSS tokens
 */
jest.mock('../../../../../../../utils/apiIndex/fetch', () => ({
  fetchApiIndex: jest.fn().mockResolvedValue({
    versions: ['v6'],
    sections: {
      v6: ['components'],
    },
    pages: {
      'v6::components': ['alert', 'button'],
    },
    tabs: {
      'v6::components::alert': ['react', 'html'],
      'v6::components::button': ['react'],
    },
    css: {
      'v6::components::alert': [
        {
          name: '--pf-v6-c-alert--BackgroundColor',
          value: '#ffffff',
          var: '--pf-v6-c-alert--BackgroundColor',
          description: 'Alert background color',
        },
        {
          name: '--pf-v6-c-alert--Color',
          value: '#151515',
          var: '--pf-v6-c-alert--Color',
          description: 'Alert text color',
        },
      ],
      'v6::components::button': [
        {
          name: '--pf-v6-c-button--BackgroundColor',
          value: '#0066cc',
          var: '--pf-v6-c-button--BackgroundColor',
          description: 'Button background color',
        },
      ],
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns CSS tokens for a valid page', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
    url: new URL('http://localhost/api/v6/components/alert/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(2)
  expect(body[0]).toHaveProperty('name')
  expect(body[0]).toHaveProperty('value')
  expect(body[0]).toHaveProperty('var')
  expect(body[0].name).toBe('--pf-v6-c-alert--BackgroundColor')
  expect(body[0].value).toBe('#ffffff')
})

it('returns CSS tokens for different pages', async () => {
  const buttonResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'button',
    },
    url: new URL('http://localhost/api/v6/components/button/css'),
  } as any)
  const buttonBody = await buttonResponse.json()

  expect(buttonResponse.status).toBe(200)
  expect(Array.isArray(buttonBody)).toBe(true)
  expect(buttonBody).toHaveLength(1)
  expect(buttonBody[0].name).toBe('--pf-v6-c-button--BackgroundColor')
})

it('returns empty array when no CSS tokens are found for page', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'nonexistent',
    },
    url: new URL('http://localhost/api/v6/components/nonexistent/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(0)
})

it('returns 400 error when version parameter is missing', async () => {
  const response = await GET({
    params: {
      section: 'components',
      page: 'alert',
    },
    url: new URL('http://localhost/api/components/alert/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version, section, and page parameters are required')
})

it('returns 400 error when section parameter is missing', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      page: 'alert',
    },
    url: new URL('http://localhost/api/v6/alert/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version, section, and page parameters are required')
})

it('returns 400 error when page parameter is missing', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
    },
    url: new URL('http://localhost/api/v6/components/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version, section, and page parameters are required')
})

it('returns 400 error when all parameters are missing', async () => {
  const response = await GET({
    params: {},
    url: new URL('http://localhost/api/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Version, section, and page parameters are required')
})

it('returns 500 error when fetchApiIndex fails', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetchApiIndex } = require('../../../../../../../utils/apiIndex/fetch')
  fetchApiIndex.mockRejectedValueOnce(new Error('Network error'))

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
    url: new URL('http://localhost/api/v6/components/alert/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body).toHaveProperty('details')
  expect(body.error).toBe('Failed to load API index')
  expect(body.details).toBe('Network error')
})

it('returns 500 error when fetchApiIndex throws a non-Error object', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetchApiIndex } = require('../../../../../../../utils/apiIndex/fetch')
  fetchApiIndex.mockRejectedValueOnce('String error')

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
    url: new URL('http://localhost/api/v6/components/alert/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body).toHaveProperty('details')
  expect(body.error).toBe('Failed to load API index')
  expect(body.details).toBe('String error')
})

it('returns empty array when CSS tokens array exists but is empty', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fetchApiIndex } = require('../../../../../../../utils/apiIndex/fetch')
  fetchApiIndex.mockResolvedValueOnce({
    versions: ['v6'],
    sections: {
      v6: ['components'],
    },
    pages: {
      'v6::components': ['empty'],
    },
    tabs: {
      'v6::components::empty': ['react'],
    },
    css: {
      'v6::components::empty': [],
    },
  })

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'empty',
    },
    url: new URL('http://localhost/api/v6/components/empty/css'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toHaveLength(0)
})
