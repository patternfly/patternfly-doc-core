import { GET } from '../../../../../../../../../pages/api/[version]/[section]/[page]/[tab]/examples/[example]'
import { access, readFile } from 'fs/promises'

jest.mock('fs/promises')
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>
const mockAccess = access as jest.MockedFunction<typeof access>

jest.mock('../../../../../../../../../content', () => ({
  content: [
    {
      name: 'react-component-docs',
      base: '/mock/monorepo/packages/react-core',
      pattern: '**/*.md',
      version: 'v6',
    },
  ],
}))

jest.mock('astro:content', () => ({
  getCollection: jest.fn((collectionName: string) => {
    const mockData: Record<string, any[]> = {
      'react-component-docs': [
        {
          id: 'components/alert/react',
          slug: 'components/alert/react',
          body: '',
          filePath: 'patternfly-docs/components/Alert/examples/Alert.md',
          data: {
            id: 'Alert',
            title: 'Alert',
            section: 'components',
            tab: 'react',
          },
          collection: 'react-component-docs',
        },
      ],
    }
    return Promise.resolve(mockData[collectionName] || [])
  }),
}))

jest.mock('../../../../../../../../../utils', () => ({
  kebabCase: jest.fn((id: string) => {
    if (!id) { return '' }
    return id
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
  }),
  getDefaultTabForApi: jest.fn((filePath?: string) => {
    if (!filePath) { return 'react' }
    if (filePath.includes('react')) { return 'react' }
    return 'react'
  }),
  addDemosOrDeprecated: jest.fn((tabName: string, filePath?: string) => {
    if (!filePath || !tabName) { return '' }
    return tabName
  }),
  addSubsection: jest.fn((page: string, subsection?: string) => {
    if (!subsection) { return page }
    return `${subsection.toLowerCase()}_${page}`
  }),
}))

jest.mock('../../../../../../../../../utils/apiIndex/generate', () => ({
  generateAndWriteApiIndex: jest.fn().mockResolvedValue({
    versions: ['v6'],
    sections: { v6: ['components'] },
    pages: { 'v6::components': ['alert'] },
    tabs: { 'v6::components::alert': ['react'] },
    examples: {
      'v6::components::alert::react': [
        { exampleName: 'AlertBasic' },
      ],
    },
  }),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

const mdxContent = `
import AlertBasic from './AlertBasic.tsx?raw'
import AlertCustomIcon from './AlertCustomIcon.tsx?raw'
`

it('resolves example files relative to base in monorepo setups', async () => {
  // Simulate monorepo: raw filePath doesn't exist at CWD, so access rejects
  mockAccess.mockRejectedValueOnce(new Error('ENOENT'))

  // First call reads the content entry file, second reads the example file
  mockReadFile
    .mockResolvedValueOnce(mdxContent)
    .mockResolvedValueOnce('const AlertBasic = () => <Alert />')

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
      example: 'AlertBasic',
    },
  } as any)

  expect(response.status).toBe(200)
  const text = await response.text()
  expect(text).toBe('const AlertBasic = () => <Alert />')

  // Content entry file should be resolved with base
  expect(mockReadFile).toHaveBeenCalledWith(
    '/mock/monorepo/packages/react-core/patternfly-docs/components/Alert/examples/Alert.md',
    'utf8'
  )

  // Example file should be resolved with base + content entry dir
  expect(mockReadFile).toHaveBeenCalledWith(
    '/mock/monorepo/packages/react-core/patternfly-docs/components/Alert/examples/AlertBasic.tsx',
    'utf8'
  )
})

it('returns 404 when example is not found in imports', async () => {
  mockAccess.mockRejectedValueOnce(new Error('ENOENT'))
  mockReadFile.mockResolvedValueOnce(mdxContent)

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
      example: 'NonExistent',
    },
  } as any)

  expect(response.status).toBe(404)
  const body = await response.json()
  expect(body.error).toContain('NonExistent')
})

it('returns 404 when example file does not exist on disk', async () => {
  mockAccess.mockRejectedValueOnce(new Error('ENOENT'))

  const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException
  enoentError.code = 'ENOENT'

  mockReadFile
    .mockResolvedValueOnce(mdxContent as any)
    .mockRejectedValueOnce(enoentError)

  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
      example: 'AlertBasic',
    },
  } as any)

  const body = await response.json()
  expect(response.status).toBe(404)
  expect(body.error).toContain('Example file not found')
})

it('returns 400 when required parameters are missing', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'alert',
      tab: 'react',
    },
  } as any)

  expect(response.status).toBe(400)
  const body = await response.json()
  expect(body.error).toContain('required')
})

it('returns 404 when content entry is not found', async () => {
  const response = await GET({
    params: {
      version: 'v6',
      section: 'components',
      page: 'nonexistent',
      tab: 'react',
      example: 'AlertBasic',
    },
  } as any)

  const body = await response.json()
  expect(response.status).toBe(404)
  expect(body.error).toContain('Content entry not found')
})
