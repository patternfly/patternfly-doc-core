/**
 * Shared test helpers and mock data for API endpoint tests
 *
 * Note: This file is named testHelpers.ts (not testUtils.ts) to avoid
 * Jest attempting to run it as a test file.
 */

/**
 * Common mock data for content collections
 */
export const mockContentCollections = {
  v6: [
    { name: 'react-component-docs', version: 'v6' },
    { name: 'core-docs', version: 'v6' },
  ],
  v6Extended: [
    { name: 'react-component-docs', version: 'v6' },
    { name: 'core-docs', version: 'v6' },
    { name: 'quickstarts-docs', version: 'v5' },
  ],
}

/**
 * Mock collection entries for different test scenarios
 */
export const mockCollectionEntries = {
  'react-component-docs': [
    {
      data: { section: 'components', id: 'Alert', tab: 'react' },
      id: 'alert-react',
      filePath: '/path/to/alert-react.md',
    },
    {
      data: { section: 'components', id: 'Alert' },
      id: 'alert-react-demos',
      filePath: '/path/to/demos/alert.md',
    },
    {
      data: { section: 'components', id: 'Button', tab: 'react' },
      id: 'button-react',
      filePath: '/path/to/button-react.md',
    },
  ],
  'react-component-docs-with-layouts': [
    { data: { section: 'components', id: 'Alert' } },
    { data: { section: 'components', id: 'Button' } },
    { data: { section: 'layouts', id: 'Grid' } },
  ],
  'core-docs': [
    {
      data: { section: 'components', id: 'Alert', tab: 'html' },
      id: 'alert-html',
      filePath: '/path/to/alert-html.md',
    },
    {
      data: {
        section: 'components',
        id: 'Alert',
        tabName: 'Design guidelines',
      },
      id: 'alert-design',
      filePath: '/path/to/alert-design.md',
    },
  ],
  'core-docs-with-utilities': [
    { data: { section: 'components', id: 'Badge' } },
    { data: { section: 'utilities', id: 'Spacing' } },
  ],
  'quickstarts-docs': [{ data: { section: 'getting-started', id: 'Intro' } }],
}

/**
 * Mock collection entries with markdown body content
 */
export const mockEntriesWithBody = {
  'react-component-docs': [
    {
      data: { section: 'components', id: 'Alert', tab: 'react' },
      id: 'alert-react',
      filePath: '/path/to/alert-react.md',
      body: '# Alert Component\n\nThis is the React Alert component documentation.',
    },
    {
      data: { section: 'components', id: 'Alert' },
      id: 'alert-react-demos',
      filePath: '/path/to/demos/alert.md',
      body: '# Alert Demos\n\nExample demos for the Alert component.',
    },
    {
      data: { section: 'components', id: 'Button', tab: 'react' },
      id: 'button-react',
      filePath: '/path/to/button-react.md',
      body: '# Button Component\n\nThis is the React Button component documentation.',
    },
  ],
  'core-docs': [
    {
      data: { section: 'components', id: 'Alert', tab: 'html' },
      id: 'alert-html',
      filePath: '/path/to/alert-html.md',
      body: '# Alert HTML\n\nHTML implementation of the Alert component.',
    },
  ],
}

/**
 * Factory for creating getCollection mock function
 * Use this inside jest.mock() factory functions with require()
 */
export const createGetCollectionMock = (entries: Record<string, any[]>) =>
  jest.fn((name: string) => Promise.resolve(entries[name] || []))

/**
 * Mock utilities module with common transformations
 */
export const mockUtils = {
  kebabCase: (str: string) => str.toLowerCase().replace(/\s+/g, '-'),
  getDefaultTab: (filePath: string) => {
    if (filePath.includes('demos')) {
      return 'react-demos'
    }
    return 'react'
  },
  addDemosOrDeprecated: (tab: string, id: string) => {
    if (id?.includes('demos')) {
      return 'react-demos'
    }
    return tab || 'react'
  },
}

/**
 * Mock tab names for display
 */
export const mockTabNames = {
  react: 'React',
  'react-demos': 'React demos',
  html: 'HTML',
  'design-guidelines': 'Design guidelines',
}
