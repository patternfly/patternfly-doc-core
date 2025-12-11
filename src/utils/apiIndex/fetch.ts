import type { ApiIndex } from './generate'

/**
 * Fetches the API index from the server as a static asset
 * Used by API routes at runtime instead of importing the JSON statically
 *
 * @param url - The URL object from the API route context
 * @returns Promise resolving to the API index structure
 */
export async function fetchApiIndex(url: URL): Promise<ApiIndex> {
  const apiIndexUrl = new URL('/apiIndex.json', url.origin)
  const response = await fetch(apiIndexUrl)

  if (!response.ok) {
    throw new Error(`Failed to load API index: ${response.status} ${response.statusText}`)
  }

  const data = (await response.json()) as ApiIndex
  return data
}
