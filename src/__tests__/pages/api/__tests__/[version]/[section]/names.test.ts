import { GET } from '../../../../../../pages/api/[version]/[section]/names'

/**
 * Mock fetchProps to return props data
 */
const mockFetchProps = jest.fn()
jest.mock('../../../../../../utils/propsData/fetch', () => ({
  fetchProps: (...args: any[]) => mockFetchProps(...args),
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
  mockFetchProps.mockResolvedValue(mockData)
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
  mockFetchProps.mockResolvedValueOnce({
    Alert: {},
    Button: {},
    AlertProps: {},
    ALERTPROPS: {},
    alertprops: {},
    ComponentProps: {},
    SomeComponentProps: {},
  })

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
  mockFetchProps.mockResolvedValueOnce({
    AlertProps: {},
    ButtonProps: {},
    ComponentProps: {},
  })

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
  mockFetchProps.mockResolvedValueOnce({})

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body).toEqual([])
})

it('returns 500 error when fetchProps fails', async () => {
  mockFetchProps.mockRejectedValueOnce(new Error('Network error'))

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Component names data not found')
  expect(body).toHaveProperty('details')
  expect(body.details).toBe('Network error')
})

it('returns 500 error when fetchProps throws a non-Error object', async () => {
  mockFetchProps.mockRejectedValueOnce('String error')

  const response = await GET({
    params: { version: 'v6', section: 'components' },
    url: new URL('http://localhost:4321/api/v6/components/names'),
  } as any)
  const body = await response.json()

  expect(response.status).toBe(500)
  expect(body).toHaveProperty('error')
  expect(body.error).toBe('Component names data not found')
  expect(body).toHaveProperty('details')
  expect(body.details).toBe('String error')
})
