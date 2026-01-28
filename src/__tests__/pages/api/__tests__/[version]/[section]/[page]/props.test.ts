import { GET } from '../../../../../../../pages/api/[version]/[section]/[page]/props'
import { getConfig } from '../../../../../../../../cli/getConfig'
import { sentenceCase, removeSubsection } from '../../../../../../../utils/case'

/**
 * Mock getConfig to return a test configuration
 */
jest.mock('../../../../../../../../cli/getConfig', () => ({
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

/**
 * Mock sentenceCase and removeSubsection utilities
 */
jest.mock('../../../../../../../utils/case', () => ({
  sentenceCase: jest.fn((id: string) =>
    // Simple mock: convert kebab-case to Sentence Case
    id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  ),
  removeSubsection: jest.fn((page: string) => {
    // Simple mock: remove subsection prefix from page name
    if (page.includes('_')) {
      return page.split('_')[1]
    }
    return page
  }),
}))

const mockData = {
  Alert: {
    name: 'Alert',
    description: '',
    props: [
      {
        name: 'variant',
        type: 'string',
        description: 'Alert variant style',
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
        description: 'Click handler function',
      },
    ],
  },
  'Sample Data Row': {
    name: 'SampleDataRow',
    description: '',
    props: [
      {
        name: 'applications',
        type: 'number',
        description: null,
        required: true,
      },
    ],
  },
  'Dashboard Wrapper': {
    name: 'DashboardWrapper',
    description: '',
    props: [
      {
        name: 'hasDefaultBreadcrumb',
        type: 'boolean',
        description: 'Flag to render sample breadcrumb if custom breadcrumb not passed',
      },
    ],
  },
  'Keyboard Handler': {
    name: 'KeyboardHandler',
    description: '',
    props: [
      {
        name: 'containerRef',
        type: 'React.RefObject<any>',
        description: 'Reference of the container to apply keyboard interaction',
        defaultValue: 'null',
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

it('returns props data for a valid page', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
  expect(body).toHaveProperty('name')
  expect(body).toHaveProperty('description')
  expect(body).toHaveProperty('props')
  expect(body.name).toBe('Alert')
  expect(Array.isArray(body.props)).toBe(true)
  expect(sentenceCase).toHaveBeenCalledWith('alert')
})

it('converts kebab-case page name to sentence case for lookup', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'sample-data-row' },
    url: new URL('http://localhost:4321/api/v6/components/sample-data-row/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.name).toBe('SampleDataRow')
  expect(sentenceCase).toHaveBeenCalledWith('sample-data-row')
})

it('handles multi-word page names correctly', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'dashboard-wrapper' },
    url: new URL('http://localhost:4321/api/v6/components/dashboard-wrapper/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.name).toBe('DashboardWrapper')
  expect(sentenceCase).toHaveBeenCalledWith('dashboard-wrapper')
})

it('returns 404 error when props data is not found', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'nonexistent' },
    url: new URL('http://localhost:4321/api/v6/components/nonexistent/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(404)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('nonexistent')
  expect(body.error).toContain('not found')
})

it('returns 400 error when page parameter is missing', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(400)
  expect(body).toHaveProperty('error')
  expect(body.error).toContain('Page parameter is required')
})

it('returns 500 error when props.json file is not found', async () => {
  mockReadFileSync.mockImplementation(() => {
    const error = new Error('ENOENT: no such file or directory')
      ; (error as any).code = 'ENOENT'
    throw error
  })

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Props data not found')
  expect(body).toHaveProperty('details')
  expect(body.details).toContain('ENOENT')
})

it('returns 500 error when props.json contains invalid JSON', async () => {
  mockReadFileSync.mockReturnValue('invalid json content')

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Props data not found')
  expect(body).toHaveProperty('details')
})

it('returns 500 error when file read throws an error', async () => {
  mockReadFileSync.mockImplementation(() => {
    throw new Error('Permission denied')
  })

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Props data not found')
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
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toHaveProperty('name')
  expect(mockJoin).toHaveBeenCalledWith('/mock/workspace/dist', 'props.json')
})

it('uses custom outputDir from config when provided', async () => {
  jest.mocked(getConfig).mockResolvedValueOnce({
    outputDir: '/custom/output/path',
    content: [],
    propsGlobs: [],
  })

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toHaveProperty('name')
  // Verify that join was called with custom outputDir
  expect(mockJoin).toHaveBeenCalledWith('/custom/output/path', 'props.json')
})

it('reads props.json from the correct file path', async () => {
  await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)

  // Verify readFileSync was called with the correct path
  expect(mockReadFileSync).toHaveBeenCalledWith('/mock/output/dir/props.json')
})

it('returns full props structure with all fields', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'keyboard-handler' },
    url: new URL('http://localhost:4321/api/v6/components/keyboard-handler/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toHaveProperty('name')
  expect(body).toHaveProperty('description')
  expect(body).toHaveProperty('props')
  expect(Array.isArray(body.props)).toBe(true)
  expect(body.props.length).toBeGreaterThan(0)
  expect(body.props[0]).toHaveProperty('name')
  expect(body.props[0]).toHaveProperty('type')
  expect(body.props[0]).toHaveProperty('description')
})

it('handles props with defaultValue field', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'keyboard-handler' },
    url: new URL('http://localhost:4321/api/v6/components/keyboard-handler/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  const propWithDefault = body.props.find((p: any) => p.defaultValue !== undefined)
  if (propWithDefault) {
    expect(propWithDefault).toHaveProperty('defaultValue')
  }
})

it('handles props with required field', async () => {
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'sample-data-row' },
    url: new URL('http://localhost:4321/api/v6/components/sample-data-row/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  const requiredProp = body.props.find((p: any) => p.required === true)
  if (requiredProp) {
    expect(requiredProp.required).toBe(true)
  }
})

it('handles components with empty props array', async () => {
  const emptyPropsData = {
    'Empty Component': {
      name: 'EmptyComponent',
      description: '',
      props: [],
    },
  }
  mockReadFileSync.mockReturnValueOnce(JSON.stringify(emptyPropsData))

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'empty-component' },
    url: new URL('http://localhost:4321/api/v6/components/empty-component/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.name).toBe('EmptyComponent')
  expect(Array.isArray(body.props)).toBe(true)
  expect(body.props).toEqual([])
})

it('handles request when tab is in URL path but not in params', async () => {
  // Note: props.ts route is at [page] level, so tab parameter is not available
  // This test verifies the route works correctly with just page parameter
  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/react/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body).toHaveProperty('name')
  expect(body.name).toBe('Alert')
})

it('removes subsection from page name before looking up props', async () => {
  // Add test data for checkbox component
  const dataWithSubsection = {
    ...mockData,
    Checkbox: {
      name: 'Checkbox',
      description: 'Checkbox component',
      props: [
        {
          name: 'isChecked',
          type: 'boolean',
          description: 'Flag to control checked state',
        },
      ],
    },
  }
  mockReadFileSync.mockReturnValueOnce(JSON.stringify(dataWithSubsection))

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'forms_checkbox' },
    url: new URL('http://localhost:4321/api/v6/components/forms_checkbox/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(body.name).toBe('Checkbox')
  expect(removeSubsection).toHaveBeenCalledWith('forms_checkbox')
  expect(sentenceCase).toHaveBeenCalledWith('checkbox')
})
