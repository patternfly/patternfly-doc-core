import type { IconMetadata } from './reactIcons'

export interface IconsIndex {
  icons: IconMetadata[]
}

/**
 * Fetches the icons index from the server as a static asset.
 * Used by API routes at runtime instead of calling getAllIcons() which uses
 * dynamic imports that fail in Cloudflare Workers.
 *
 * @param url - The URL object from the API route context
 * @returns Promise resolving to the icons index structure
 */
export async function fetchIconsIndex(url: URL): Promise<IconMetadata[]> {
  const iconsIndexUrl = new URL('/iconsIndex.json', url.origin)
  const response = await fetch(iconsIndexUrl)

  if (!response.ok) {
    throw new Error(
      `Failed to load icons index: ${response.status} ${response.statusText}`
    )
  }

  const data = (await response.json()) as IconsIndex
  return data.icons
}

/**
 * Fetches prerendered SVG markup for all icons in a set.
 * Used by the icon SVG API route at runtime instead of getIconSvg() which
 * uses dynamic imports that fail in Cloudflare Workers.
 *
 * @param url - The URL object from the API route context
 * @param setId - Icon set id (e.g., "fa", "ci")
 * @returns Promise resolving to Record of iconName -> SVG string, or null if fetch fails
 */
export async function fetchIconSvgs(
  url: URL,
  setId: string,
): Promise<Record<string, string> | null> {
  const iconsSvgsUrl = new URL(`/iconsSvgs/${setId}.json`, url.origin)
  const response = await fetch(iconsSvgsUrl)

  if (!response.ok) {
    return null
  }

  return (await response.json()) as Record<string, string>
}
