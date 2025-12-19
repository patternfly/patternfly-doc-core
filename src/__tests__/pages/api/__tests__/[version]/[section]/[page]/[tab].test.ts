import { GET } from '../../../../../../../pages/api/[version]/[section]/[page]/[tab]'

/**
 * Mock content collections with entries that have body content
 * to test markdown/MDX content retrieval
 */
jest.mock('../../../../../../../content', () => ({
  content: [
    {
      name: 'react-component-docs',
      base: '/mock/path/react',
      pattern: '**/*.md',
      version: 'v6',
    },
    {
      name: 'core-docs',
      base: '/mock/path/core',
      pattern: '**/*.md',
      version: 'v6',
    },
  ],
}))

/**
 * Mock getCollection to return entries with body (markdown content)
 * simulating real documentation pages with content
 */
jest.mock('astro:content', () => ({
  getCollection: jest.fn((collectionName: string) => {
    const mockData: Record<string, any[]> = {
      'react-component-docs': [
        {
          id: 'components/alert/react',
          slug: 'components/alert/react',
          body: '# Alert Component\n\nReact Alert documentation content',
          data: {
            id: 'Alert',
            title: 'Alert',
            section: 'components',
            tab: 'react',
          },
          collection: 'react-component-docs',
        },
        {
          id: 'components/alert/html',
          slug: 'components/alert/html',
          body: '# Alert HTML\n\nHTML Alert documentation content',
          data: {
            id: 'Alert',
            title: 'Alert',
            section: 'components',
            tab: 'html',
          },
          collection: 'react-component-docs',
        },
        {
          id: 'components/alert/react-demos',
          slug: 'components/alert/react-demos',
          body: '# Alert Demos\n\nReact demos content',
          data: {
            id: 'Alert',
            title: 'Alert Demos',
            section: 'components',
            tab: 'react-demos',
          },
          collection: 'react-component-docs',
        },
      ],
      'core-docs': [],
    }
    return Promise.resolve(mockData[collectionName] || [])
  }),
}))

/**
 * Mock utilities for tab identification and transformation
 */
jest.mock('../../../../../../../utils', () => ({
  kebabCase: jest.fn((id: string) => {
    if (!id) {
      return ''
    }
    return id
      .replace(/PatternFly/g, 'Patternfly')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }),
  getDefaultTabForApi: jest.fn((filePath?: string) => {
    if (!filePath) {
      return 'react'
    }
    if (filePath.includes('react')) {
      return 'react'
    }
    if (filePath.includes('html')) {
      return 'html'
    }
    return 'react'
  }),
  addDemosOrDeprecated: jest.fn((tabName: string, filePath?: string) => {
    if (!filePath || !tabName) {
      return ''
    }
    let result = tabName
    if (filePath.includes('demos') && !tabName.includes('-demos')) {
      result += '-demos'
    }
    if (filePath.includes('deprecated') && !tabName.includes('-deprecated')) {
      result += '-deprecated'
    }
    return result
  }),
}))

/**
 * Mock API index to validate paths
 */
jest.mock('../../../../../../../utils/apiIndex/get', () => ({
  getApiIndex: jest.fn().mockResolvedValue({
    versions: ['v6'],
    sections: {
      v6: ['components'],
    },
    pages: {
      'v6::components': ['alert'],
    },
    tabs: {
      'v6::components::alert': ['react', 'html', 'react-demos'],
    },
  }),
}))

/**
 * Mock fetchApiIndex to return the same data as getApiIndex
 */
jest.mock('../../../../../../../utils/apiIndex/fetch', () => ({
  fetchApiIndex: jest.fn().mockResolvedValue({
    versions: ['v6'],
    sections: {
      v6: ['components'],
    },
    pages: {
      'v6::components': ['alert'],
    },
    tabs: {
      'v6::components::alert': ['react', 'html', 'react-demos'],
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

it('redirects to /text endpoint', async () => {
  const mockRedirect = jest.fn((path: string) => new Response(null, { status: 302, headers: { Location: path } }))
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
    url: new URL('http://localhost/api/v6/components/alert/react'),
    redirect: mockRedirect,
  } as any)

  expect(mockRedirect).toHaveBeenCalledWith('/api/v6/components/alert/react/text')
  expect(response.status).toBe(302)
})

it('redirects to /text endpoint for different tabs', async () => {
  const mockRedirect = jest.fn((path: string) => new Response(null, { status: 302, headers: { Location: path } }))

  const reactResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
    url: new URL('http://localhost/api/v6/components/alert/react'),
    redirect: mockRedirect,
  } as any)

  expect(reactResponse.status).toBe(302)
  expect(mockRedirect).toHaveBeenCalledWith('/api/v6/components/alert/react/text')

  mockRedirect.mockClear()
  const htmlResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'html',
    },
    url: new URL('http://localhost/api/v6/components/alert/html'),
    redirect: mockRedirect,
  } as any)

  expect(htmlResponse.status).toBe(302)
  expect(mockRedirect).toHaveBeenCalledWith('/api/v6/components/alert/html/text')
})

it('redirects demos tabs to /text endpoint', async () => {
  const mockRedirect = jest.fn((path: string) => new Response(null, { status: 302, headers: { Location: path } }))
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react-demos',
    },
    url: new URL('http://localhost/api/v6/components/alert/react-demos'),
    redirect: mockRedirect,
  } as any)

  expect(response.status).toBe(302)
  expect(mockRedirect).toHaveBeenCalledWith('/api/v6/components/alert/react-demos/text')
})

it('returns 404 error for nonexistent version', async () => {
  const mockRedirect = jest.fn()
  const response = await GET({
    params: {
      version: 'v99',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
    url: new URL('http://localhost/api/v99/components/alert/react'),
    redirect: mockRedirect,
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
})

it('returns 404 error for nonexistent section', async () => {
  const mockRedirect = jest.fn()
  const response = await GET({
    params: {
      version: 'v6',
      section: 'invalid',
      page: 'alert',
      tab: 'react',
    },
    url: new URL('http://localhost/api/v6/invalid/alert/react'),
    redirect: mockRedirect,
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
})

it('returns 404 error for nonexistent page', async () => {
  const mockRedirect = jest.fn()
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'nonexistent',
      tab: 'react',
    },
    url: new URL('http://localhost/api/v6/components/nonexistent/react'),
    redirect: mockRedirect,
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 404 error for nonexistent tab', async () => {
  const mockRedirect = jest.fn()
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'nonexistent',
    },
    url: new URL('http://localhost/api/v6/components/alert/nonexistent'),
    redirect: mockRedirect,
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 400 error when required parameters are missing', async () => {
  const mockRedirect = jest.fn()
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
    url: new URL('http://localhost/api/v6/components/alert'),
    redirect: mockRedirect,
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')
})
