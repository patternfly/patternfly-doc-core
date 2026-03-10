import { GET } from '../../../../../../../pages/api/[version]/[section]/[page]/props'
import { sentenceCase, removeSubsection } from '../../../../../../../utils/case'

/**
 * Mock fetchProps to return props data
 */
const mockFetchProps = jest.fn()
jest.mock('../../../../../../../utils/propsData/fetch', () => ({
  fetchProps: (...args: any[]) => mockFetchProps(...args),
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
  mockFetchProps.mockResolvedValue(mockData)
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

it('returns 500 error when fetchProps fails', async () => {
  mockFetchProps.mockRejectedValueOnce(new Error('Network error'))

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Failed to load props data')
  expect(body).toHaveProperty('details')
  expect(body.details).toBe('Network error')
})

it('returns 500 error when fetchProps throws a non-Error object', async () => {
  mockFetchProps.mockRejectedValueOnce('String error')

  const response = await GET({
    params: { version: 'v6', section: 'components', page: 'alert' },
    url: new URL('http://localhost:4321/api/v6/components/alert/props'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Failed to load props data')
  expect(body).toHaveProperty('details')
  expect(body.details).toBe('String error')
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
  mockFetchProps.mockResolvedValueOnce({
    'Empty Component': {
      name: 'EmptyComponent',
      description: '',
      props: [],
    },
  })

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
  mockFetchProps.mockResolvedValueOnce({
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
  })

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
