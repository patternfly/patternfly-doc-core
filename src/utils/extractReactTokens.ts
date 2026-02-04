/**
 * Converts a CSS prefix (e.g., "pf-v6-c-accordion") to a token prefix (e.g., "c_accordion")
 *
 * @param cssPrefix - The CSS prefix from front matter
 * @returns The token prefix used in componentIndex
 */
function cssPrefixToTokenPrefix(cssPrefix: string): string {
  // Remove "pf-v6-" prefix and replace hyphens with underscores to match the tokens.
  return cssPrefix.replace(/^pf-v6-/, '').replace(/-+/g, '_')
}

type TokenEntry = {
  name: string
  value: string
  values?: string[]
}

/**
 * Extracts all token objects from @patternfly/react-tokens componentIndex that match a given CSS prefix
 *
 * @param cssPrefix - The CSS prefix (e.g., "pf-v6-c-accordion")
 * @returns Array of token objects with name, value, and var properties
 */
export async function extractReactTokens(
  cssPrefix: string | string[],
): Promise<{ name: string; value: string; var: string }[]> {
  // Handle both single prefix and array of prefixes to support subcomponents.
  const prefixes = Array.isArray(cssPrefix) ? cssPrefix : [cssPrefix]
  const tokenPrefixes = prefixes.map(cssPrefixToTokenPrefix)

  let componentIndex: Record<string, Record<string, Record<string, TokenEntry>>>
  try {
    const module = await import(
      '@patternfly/react-tokens/dist/esm/componentIndex'
    )
    // Exclude default export - componentIndex exports named components (c_accordion, etc.)
    componentIndex = Object.fromEntries(
      Object.entries(module).filter(([key]) => key !== 'default'),
    ) as unknown as Record<
      string,
      Record<string, Record<string, TokenEntry>>
    >
  } catch {
    return []
  }

  // Get unique base components (e.g., c_accordion from c_accordion__expandable_content)
  const baseComponents = new Set(
    tokenPrefixes.map((p) => p.split('__')[0]),
  )

  const tokensMap = new Map<string, { name: string; value: string; var: string }>()

  for (const baseComponent of baseComponents) {
    const componentData = componentIndex[baseComponent]
    if (!componentData || typeof componentData !== 'object') {
      continue
    }

    for (const selectorTokens of Object.values(componentData)) {
      if (!selectorTokens || typeof selectorTokens !== 'object') {
        continue
      }

      for (const [tokenKey, token] of Object.entries(selectorTokens)) {
        if (
          !token ||
          typeof token !== 'object' ||
          typeof token.name !== 'string' ||
          typeof token.value !== 'string'
        ) {
          continue
        }

        // Include token if its key starts with any of our token prefixes
        if (!tokenPrefixes.some((prefix) => tokenKey.startsWith(prefix))) {
          continue
        }

        tokensMap.set(token.name, {
          name: token.name,
          value: token.value,
          var: `var(${token.name})`,
        })
      }
    }
  }

  return Array.from(tokensMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}
