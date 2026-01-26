import { GET } from '../../../../../../pages/api/[version]/[section]/names'
import { getConfig } from '../../../../../../../cli/getConfig'

/**
 * Mock getConfig to return a test configuration
 */
jest.mock('../../../../../../../cli/getConfig', () => ({
  getConfig: jest.fn().mockResolvedValue({
    outputDir: '/mock/output/dir',
  }),
}))

/**
 * Mock node:path join function
 */
const mockJoin = jest.fn((...paths: string[]) => paths.join('/'))
jest.mock('node:path', () => ({
  join: (...args: any[]) => mockJoin(...args),
}))

/**
 * Mock node:fs readFileSync function
 */
const mockReadFileSync = jest.fn()
jest.mock('node:fs', () => ({
  readFileSync: (...args: any[]) => mockReadFileSync(...args),
}))

const mockData = {
  Alert: {
    name: 'Alert',
    description: '',
    props: [
      {
        name: 'variant',
        type: 'string',
        description: 'Alert variant',
      },
    ],
  },
  Button: {
    name: 'Button',
    description: '',
    props: [
      {
        name: 'onClick',
        type: 'function',
        description: 'Click handler',
      },
    ],
  },
  Card: {
    name: 'Card',
    description: '',
    props: [
      {
        name: 'title',
        type: 'string',
        description: 'Card title',
      },
    ],
  },
  AlertProps: {
    name: 'AlertProps',
    description: '',
    props: [
      {
        name: 'someProp',
        type: 'string',
        description: null,
      },
    ],
  },
  ButtonComponentProps: {
    name: 'ButtonComponentProps',
    description: '',
    props: [
      {
        name: 'anotherProp',
        type: 'string',
        description: null,
      },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  // Reset process.cwd mock
  process.cwd = jest.fn(() => '/mock/workspace')
  // Reset mockReadFileSync to return default mock data
  mockReadFileSync.mockReturnValue(JSON.stringify(mockData))
})

it('returns filtered component names from props.json data', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(Array.isArray(body)).toBe(true)
  expect(body).toContain('Alert')
  expect(body).toContain('Button')
  expect(body).toContain('Card')
  expect(body).not.toContain('AlertProps')
  expect(body).not.toContain('ButtonComponentProps')
})

it('filters out all keys containing "Props" case-insensitively', async () => {
  const testData = {
    Alert: {},
    Button: {},
    AlertProps: {},
    ALERTPROPS: {},
    alertprops: {},
    ComponentProps: {},
    SomeComponentProps: {},
  }

  mockReadFileSync.mockReturnValue(JSON.stringify(testData))

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toEqual(['Alert', 'Button'])
  expect(body).not.toContain('AlertProps')
  expect(body).not.toContain('ALERTPROPS')
  expect(body).not.toContain('alertprops')
  expect(body).not.toContain('ComponentProps')
  expect(body).not.toContain('SomeComponentProps')
})

it('returns empty array when props.json has no valid component names', async () => {
  const testData = {
    AlertProps: {},
    ButtonProps: {},
    ComponentProps: {},
  }

  mockReadFileSync.mockReturnValue(JSON.stringify(testData))

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toEqual([])
})

it('returns empty array when props.json is empty', async () => {
  mockReadFileSync.mockReturnValue(JSON.stringify({}))

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toEqual([])
})

it('returns 500 error when props.json file is not found', async () => {
  mockReadFileSync.mockImplementation(() => {
    const error = new Error('ENOENT: no such file or directory')
      ; (error as any).code = 'ENOENT'
    throw error
  })

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Component names data not found')
  expect(body).toHaveProperty('details')
  expect(body.details).toContain('ENOENT')
})

it('returns 500 error when props.json contains invalid JSON', async () => {
  mockReadFileSync.mockReturnValue('invalid json content')

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Component names data not found')
  expect(body).toHaveProperty('details')
})

it('returns 500 error when file read throws an error', async () => {
  mockReadFileSync.mockImplementation(() => {
    throw new Error('Permission denied')
  })

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Component names data not found')
  expect(body).toHaveProperty('details')
  expect(body.details).toContain('Permission denied')
})

it('uses default outputDir when config does not provide one', async () => {
  jest.mocked(getConfig).mockResolvedValueOnce({
    content: [],
    propsGlobs: [],
    outputDir: '',
  })

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(mockJoin).toHaveBeenCalledWith('/mock/workspace/dist', 'props.json')
})

it('uses custom outputDir from config when provided', async () => {
  jest.mocked(getConfig).mockResolvedValueOnce({
    outputDir: '/custom/output/path',
    content: [],
    propsGlobs: [],
  })

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(mockJoin).toHaveBeenCalledWith('/custom/output/path', 'props.json')
})

it('reads props.json from the correct file path', async () => {
  await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)

  expect(mockReadFileSync).toHaveBeenCalledWith('/mock/output/dir/props.json')
})
