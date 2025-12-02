import { createJsonResponse, createTextResponse, createIndexKey } from '../apiHelpers'

describe('createJsonResponse', () => {
  it('returns a Response with status 200 by default', () => {
    const response = createJsonResponse({ message: 'success' })
    expect(response.status).toBe(200)
  })

  it('returns a Response with custom status code', () => {
    const response = createJsonResponse({ error: 'not found' }, 404)
    expect(response.status).toBe(404)
  })

  it('sets correct Content-Type header with charset', () => {
    const response = createJsonResponse({ test: 'data' })
    expect(response.headers.get('Content-Type')).toBe(
      'application/json; charset=utf-8',
    )
  })

  it('sets Cache-Control header to no-cache', () => {
    const response = createJsonResponse({ test: 'data' })
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
  })

  it('sets Date header', () => {
    const response = createJsonResponse({ test: 'data' })
    const dateHeader = response.headers.get('Date')
    expect(dateHeader).toBeTruthy()
    // Verify it's a valid date string
    expect(new Date(dateHeader!).toString()).not.toBe('Invalid Date')
  })

  it('sets Content-Length header to match body length', async () => {
    const data = { message: 'test', count: 42 }
    const response = createJsonResponse(data)
    const body = await response.text()
    expect(response.headers.get('Content-Length')).toBe(body.length.toString())
  })

  it('correctly serializes an object', async () => {
    const data = { message: 'hello', nested: { value: 123 } }
    const response = createJsonResponse(data)
    const body = await response.json()
    expect(body).toEqual(data)
  })

  it('correctly serializes an array', async () => {
    const data = ['one', 'two', 'three']
    const response = createJsonResponse(data)
    const body = await response.json()
    expect(body).toEqual(data)
  })

  it('correctly serializes a string', async () => {
    const data = 'plain string'
    const response = createJsonResponse(data)
    const body = await response.json()
    expect(body).toBe(data)
  })

  it('correctly serializes null', async () => {
    const response = createJsonResponse(null)
    const body = await response.json()
    expect(body).toBeNull()
  })

  it('correctly serializes an empty object', async () => {
    const response = createJsonResponse({})
    const body = await response.json()
    expect(body).toEqual({})
  })

  it('correctly serializes an empty array', async () => {
    const response = createJsonResponse([])
    const body = await response.json()
    expect(body).toEqual([])
  })

  it('handles complex nested data structures', async () => {
    const data = {
      users: [
        { id: 1, name: 'Alice', tags: ['admin', 'user'] },
        { id: 2, name: 'Bob', tags: ['user'] },
      ],
      meta: { total: 2, page: 1 },
    }
    const response = createJsonResponse(data)
    const body = await response.json()
    expect(body).toEqual(data)
  })

  it('creates error responses with proper status codes', async () => {
    const errorData = { error: 'Bad Request', message: 'Invalid input' }
    const response = createJsonResponse(errorData, 400)
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toEqual(errorData)
  })
})

describe('createTextResponse', () => {
  it('returns a Response with status 200 by default', () => {
    const response = createTextResponse('Hello, world!')
    expect(response.status).toBe(200)
  })

  it('returns a Response with custom status code', () => {
    const response = createTextResponse('Not found', 404)
    expect(response.status).toBe(404)
  })

  it('sets correct Content-Type header with charset', () => {
    const response = createTextResponse('test content')
    expect(response.headers.get('Content-Type')).toBe(
      'text/plain; charset=utf-8',
    )
  })

  it('sets Cache-Control header to no-cache', () => {
    const response = createTextResponse('test content')
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
  })

  it('sets Date header', () => {
    const response = createTextResponse('test content')
    const dateHeader = response.headers.get('Date')
    expect(dateHeader).toBeTruthy()
    // Verify it's a valid date string
    expect(new Date(dateHeader!).toString()).not.toBe('Invalid Date')
  })

  it('sets Content-Length header to match content length', () => {
    const content = 'This is test content'
    const response = createTextResponse(content)
    expect(response.headers.get('Content-Length')).toBe(
      content.length.toString(),
    )
  })

  it('returns correct text content', async () => {
    const content = 'Hello, world!'
    const response = createTextResponse(content)
    const body = await response.text()
    expect(body).toBe(content)
  })

  it('handles empty string', async () => {
    const response = createTextResponse('')
    const body = await response.text()
    expect(body).toBe('')
    // Content-Length is omitted when length is 0
    expect(response.headers.get('Content-Length')).toBeNull()
  })

  it('handles multiline text', async () => {
    const content = 'Line 1\nLine 2\nLine 3'
    const response = createTextResponse(content)
    const body = await response.text()
    expect(body).toBe(content)
  })

  it('handles unicode characters', async () => {
    const content = 'Hello 世界 🌍'
    const response = createTextResponse(content)
    const body = await response.text()
    expect(body).toBe(content)
  })

  it('handles markdown content', async () => {
    const markdown = `# Heading

## Subheading

- Item 1
- Item 2

\`\`\`javascript
const foo = 'bar';
\`\`\`
`
    const response = createTextResponse(markdown)
    const body = await response.text()
    expect(body).toBe(markdown)
  })

  it('creates error responses with proper status codes', async () => {
    const errorText = 'Internal Server Error'
    const response = createTextResponse(errorText, 500)
    expect(response.status).toBe(500)
    const body = await response.text()
    expect(body).toBe(errorText)
  })
})

describe('createIndexKey', () => {
  it('creates a key from a single part', () => {
    const key = createIndexKey('v6')
    expect(key).toBe('v6')
  })

  it('creates a key from two parts', () => {
    const key = createIndexKey('v6', 'components')
    expect(key).toBe('v6::components')
  })

  it('creates a key from three parts', () => {
    const key = createIndexKey('v6', 'components', 'alert')
    expect(key).toBe('v6::components::alert')
  })

  it('creates a key from four parts', () => {
    const key = createIndexKey('v6', 'components', 'alert', 'react')
    expect(key).toBe('v6::components::alert::react')
  })

  it('handles empty string parts', () => {
    const key = createIndexKey('v6', '', 'alert')
    expect(key).toBe('v6::::alert')
  })

  it('handles special characters in parts', () => {
    const key = createIndexKey('v6', 'my-section', 'my_page')
    expect(key).toBe('v6::my-section::my_page')
  })

  it('returns empty string when called with no arguments', () => {
    const key = createIndexKey()
    expect(key).toBe('')
  })
})
