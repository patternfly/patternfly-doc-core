/**
 * Test helpers for API route tests
 */

export const mockContentCollections = {
  v6: [
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
}

export const mockEntriesWithBody = {
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

export const createGetCollectionMock = (collections: Record<string, any[]>) =>
  jest.fn((collectionName: string) =>
    Promise.resolve(collections[collectionName] || []),
  )

export const mockUtils = {
  isReactTab: jest.fn((tab: string) => tab.includes('react')),
  isHtmlTab: jest.fn((tab: string) => tab.includes('html')),
  isDemosTab: jest.fn((tab: string) => tab.includes('demos')),
  transformTabSlug: jest.fn((slug: string) => slug),
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
  getDefaultTab: jest.fn((filePath?: string) => {
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
}
