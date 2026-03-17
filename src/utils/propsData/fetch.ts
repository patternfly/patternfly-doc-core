/**
 * Fetches the props data from the server as a static asset
 * Used by API routes at runtime instead of reading from the filesystem
 *
 * @param url - The URL object from the API route context
 * @returns Promise resolving to the props data structure
 */
export async function fetchProps(url: URL): Promise<Record<string, any>> {
  const propsUrl = new URL('/props.json', url.origin)
  const response = await fetch(propsUrl)

  if (!response.ok) {
    throw new Error(`Failed to load props data: ${response.status} ${response.statusText}`)
  }

  return await response.json()
}
