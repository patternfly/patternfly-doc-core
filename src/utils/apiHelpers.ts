function getHeaders(
  type: 'application/json' | 'text/plain',
  contentLength?: number,
): HeadersInit {
  return {
    'Content-Type': `${type}; charset=utf-8`,
    'Cache-Control': 'no-cache',
    Date: new Date().toUTCString(),
    'Content-Length': contentLength?.toString() || '',
  }
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
