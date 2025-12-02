function getHeaders(
  type: 'application/json' | 'text/plain',
  contentLength?: number,
): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-cache',
    Date: new Date().toUTCString(),
  }

  if (contentLength) {
    headers['Content-Length'] = contentLength.toString()
  }

  return headers
}

export function createJsonResponse(
  data: unknown,
  status: number = 200,
): Response {
  const body = JSON.stringify(data)
  return new Response(body, {
    status,
    headers: getHeaders('application/json', body.length),
  })
}

export function createTextResponse(
  content: string,
  status: number = 200,
): Response {
  return new Response(content, {
    status,
    headers: getHeaders('text/plain', content.length),
  })
}

/**
 * Creates an index key by joining parts with '::' separator
 * Used to construct keys for looking up sections, pages, and tabs in the API index
 *
 * @example
 * createIndexKey('v6') // 'v6'
 * createIndexKey('v6', 'components') // 'v6::components'
 * createIndexKey('v6', 'components', 'alert') // 'v6::components::alert'
 */
export function createIndexKey(...parts: string[]): string {
  return parts.join('::')
}
