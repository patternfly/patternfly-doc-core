import * as allTokens from '@patternfly/react-tokens'

export interface Token {
  name: string
  value: string
  var: string
}

export interface TokensByCategory {
  [category: string]: Token[]
}

let cachedTokens: Token[] | null = null
let cachedCategories: string[] | null = null
let cachedTokensByCategory: TokensByCategory | null = null

/**
 * Extracts the category from a token name
 * Categories are determined by the first prefix before underscore
 * Examples:
 *   c_alert_Title -> c
 *   t_global_color -> t
 *   chart_color_blue -> chart
 */
function getCategoryFromTokenName(tokenName: string): string {
  const firstUnderscore = tokenName.indexOf('_')
  if (firstUnderscore === -1) {
    return tokenName
  }
  return tokenName.substring(0, firstUnderscore)
}

/**
 * Loads all tokens from @patternfly/react-tokens
 * Returns an array of token objects with { name, value, var }
 */
export function getAllTokens(): Token[] {
  if (cachedTokens) {
    return cachedTokens
  }

  const tokens: Token[] = []

  for (const [_exportName, tokenValue] of Object.entries(allTokens)) {
    if (typeof tokenValue === 'object' && tokenValue !== null) {
      const token = tokenValue as Token

      if (token.name && token.value && token.var) {
        tokens.push({
          name: token.name,
          value: token.value,
          var: token.var,
        })
      }
    }
  }

  cachedTokens = tokens
  return tokens
}

/**
 * Gets a sorted array of unique token categories
 */
export function getTokenCategories(): string[] {
  if (cachedCategories) {
    return cachedCategories
  }

  const tokens = getAllTokens()
  const categorySet = new Set<string>()

  for (const token of tokens) {
    const category = getCategoryFromTokenName(token.name)
    categorySet.add(category)
  }

  cachedCategories = Array.from(categorySet).sort()
  return cachedCategories
}

/**
 * Gets all tokens organized by category
 */
export function getTokensByCategory(): TokensByCategory {
  if (cachedTokensByCategory) {
    return cachedTokensByCategory
  }

  const tokens = getAllTokens()
  const byCategory: TokensByCategory = {}

  for (const token of tokens) {
    const category = getCategoryFromTokenName(token.name)
    if (!byCategory[category]) {
      byCategory[category] = []
    }
    byCategory[category].push(token)
  }

  cachedTokensByCategory = byCategory
  return byCategory
}

/**
 * Gets tokens for a specific category
 * Returns undefined if category doesn't exist
 */
export function getTokensForCategory(category: string): Token[] | undefined {
  const byCategory = getTokensByCategory()
  return byCategory[category]
}

/**
 * Filters tokens by substring match (case-insensitive)
 * Matches against the token name field
 */
export function filterTokens(tokens: Token[], filter: string): Token[] {
  if (!filter) {
    return tokens
  }

  const lowerFilter = filter.toLowerCase()
  return tokens.filter((token) =>
    token.name.toLowerCase().includes(lowerFilter),
  )
}

/**
 * Filters tokens by category (case-insensitive)
 * Matches against the category name
 */
export function filterTokensByCategory(
  byCategory: TokensByCategory,
  filter: string,
): TokensByCategory {
  if (!filter) {
    return byCategory
  }

  const filtered: TokensByCategory = {}
  for (const [category, tokens] of Object.entries(byCategory)) {
    const filteredTokens = filterTokens(tokens, filter)
    if (filteredTokens.length > 0) {
      filtered[category] = filteredTokens
    }
  }

  return filtered
}
