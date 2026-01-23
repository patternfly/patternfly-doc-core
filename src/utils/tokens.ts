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

function getCategoryFromTokenName(tokenName: string): string {
  const nameWithoutPfPrefix = tokenName.replace(/^--pf-/, '')
  const parts = nameWithoutPfPrefix.split(/-+/)
  if (/^v\d+/.test(parts[0])) {
    return parts[1]
  }

  return parts[0]
  // --pf-[t|vX]-
  // add test for nonversion token
  // strip out leading --pf-
  // check if 1st thing is version, strip out version and grab first part after, v6-chart-global
  // if not version, put that thing in category
  // CSS variable format: --pf-v6-{category}-...
  // Split by hyphen and get the category part (index 4 after splitting)
}

export function getAllTokens(): Token[] {
  if (cachedTokens) {
    return cachedTokens
  }

  const tokens: Token[] = []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function getTokensForCategory(category: string): Token[] | undefined {
  const byCategory = getTokensByCategory()
  return byCategory[category]
}

export function filterTokens(tokens: Token[], filter: string): Token[] {
  if (!filter) {
    return tokens
  }

  const lowerFilter = filter.toLowerCase()
  return tokens.filter((token) =>
    token.name.toLowerCase().includes(lowerFilter),
  )
}

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
