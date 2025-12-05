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

beforeEach(() => {
  jest.clearAllMocks()
})

it('returns markdown/MDX content as plain text', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  expect(typeof body).toBe('string')
  expect(body).toContain('Alert Component')
})

it('returns different content for different tabs', async () => {
  const reactResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const reactBody = await reactResponse.text()

  const htmlResponse = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'html',
    },
  } as any)
  const htmlBody = await htmlResponse.text()

  expect(reactBody).toContain('React Alert')
  expect(htmlBody).toContain('HTML')
  expect(reactBody).not.toEqual(htmlBody)
})

it('returns demo content for demos tabs', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react-demos',
    },
  } as any)
  const body = await response.text()

  expect(response.status).toBe(200)
  expect(body).toContain('demos')
})

it('returns 404 error for nonexistent version', async () => {
  const response = await GET({
    params: {
      version: 'v99',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('v99')
})

it('returns 404 error for nonexistent section', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'invalid',
      page: 'alert',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
})

it('returns 404 error for nonexistent page', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'nonexistent',
      tab: 'react',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 404 error for nonexistent tab', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'nonexistent',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
})

it('returns 400 error when required parameters are missing', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
    },
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('required')
})
