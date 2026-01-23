jest.mock('@patternfly/react-tokens', () => ({
  // eslint-disable-next-line camelcase
  c_alert_BackgroundColor: {
    name: '--pf-v6-c-alert--BackgroundColor',
    value: '#ffffff',
    var: 'var(--pf-v6-c-alert--BackgroundColor)',
  },
  // eslint-disable-next-line camelcase
  c_alert_Color: {
    name: '--pf-v6-c-alert--Color',
    value: '#000000',
    var: 'var(--pf-v6-c-alert--Color)',
  },
  // eslint-disable-next-line camelcase
  c_button_BackgroundColor: {
    name: '--pf-v6-c-button--BackgroundColor',
    value: '#0066cc',
    var: 'var(--pf-v6-c-button--BackgroundColor)',
  },
  // eslint-disable-next-line camelcase
  t_global_color_100: {
    name: '--pf-v6-t-global--color--100',
    value: '#f0f0f0',
    var: 'var(--pf-v6-t-global--color--100)',
  },
  // eslint-disable-next-line camelcase
  t_global_color_200: {
    name: '--pf-t-global--color--200',
    value: '#e0e0e0',
    var: 'var(--pf-t-global--color--200)',
  },
  // eslint-disable-next-line camelcase
  chart_global_Fill: {
    name: '--pf-v6-chart-global--Fill',
    value: '#06c',
    var: 'var(--pf-v6-chart-global--Fill)',
  },
  // eslint-disable-next-line camelcase
  l_grid_gutter: {
    name: '--pf-v6-l-grid--gutter',
    value: '1rem',
    var: 'var(--pf-v6-l-grid--gutter)',
  },
  invalidToken: {
    name: '--invalid',
  },
  default: 'should be ignored',
}))

import {
  getAllTokens,
  getTokenCategories,
  getTokensByCategory,
  getTokensForCategory,
  filterTokens,
  filterTokensByCategory,
} from '../../utils/tokens'

describe('getAllTokens', () => {
  it('returns all valid tokens', () => {
    const tokens = getAllTokens()

    expect(Array.isArray(tokens)).toBe(true)
    expect(tokens.length).toBe(7) // 7 valid tokens in mockTokens
  })

  it('each token has required properties', () => {
    const tokens = getAllTokens()

    tokens.forEach((token) => {
      expect(token).toHaveProperty('name')
      expect(token).toHaveProperty('value')
      expect(token).toHaveProperty('var')
      expect(typeof token.name).toBe('string')
      expect(typeof token.value).toBe('string')
      expect(typeof token.var).toBe('string')
    })
  })

  it('filters out invalid tokens', () => {
    const tokens = getAllTokens()

    // Should not include the invalid token or non-object exports
    const tokenNames = tokens.map((t) => t.name)
    expect(tokenNames).not.toContain('--invalid')
  })

  it('returns cached tokens on subsequent calls', () => {
    const tokens1 = getAllTokens()
    const tokens2 = getAllTokens()

    // Should return the same array reference (cached)
    expect(tokens1).toBe(tokens2)
  })
})

describe('getTokenCategories', () => {
  it('returns sorted array of categories', () => {
    const categories = getTokenCategories()

    expect(Array.isArray(categories)).toBe(true)
    expect(categories).toEqual(['c', 'chart', 'l', 't'])
  })

  it('categories are alphabetically sorted', () => {
    const categories = getTokenCategories()
    const sorted = [...categories].sort()

    expect(categories).toEqual(sorted)
  })

  it('categories are unique', () => {
    const categories = getTokenCategories()
    const unique = [...new Set(categories)]

    expect(categories).toEqual(unique)
  })

  it('returns cached categories on subsequent calls', () => {
    const categories1 = getTokenCategories()
    const categories2 = getTokenCategories()

    expect(categories1).toBe(categories2)
  })
})

describe('getTokensByCategory', () => {
  it('returns object with category keys', () => {
    const byCategory = getTokensByCategory()

    expect(typeof byCategory).toBe('object')
    expect(byCategory).toHaveProperty('c')
    expect(byCategory).toHaveProperty('t')
    expect(byCategory).toHaveProperty('chart')
    expect(byCategory).toHaveProperty('l')
  })

  it('groups tokens correctly by category', () => {
    const byCategory = getTokensByCategory()

    expect(byCategory.c).toHaveLength(3) // c_alert_BackgroundColor, c_alert_Color, c_button_BackgroundColor
    expect(byCategory.t).toHaveLength(2) // t_global_color_100, t_global_color_200
    expect(byCategory.chart).toHaveLength(1) // chart_global_Fill
    expect(byCategory.l).toHaveLength(1) // l_grid_gutter
  })

  it('all tokens in a category have correct prefix', () => {
    const byCategory = getTokensByCategory()

    Object.entries(byCategory).forEach(([category, tokens]) => {
      tokens.forEach((token) => {
        const isVersionedToken = /^--pf-v6/.test(token.name)
        const prefix = token.name.split('-')[isVersionedToken ? 4 : 3] // --pf-v6-{prefix}- if versioned or --pf-{prefix}- if unversioned
        expect(prefix).toBe(category)
      })
    })
  })

  it('returns cached result on subsequent calls', () => {
    const byCategory1 = getTokensByCategory()
    const byCategory2 = getTokensByCategory()

    expect(byCategory1).toBe(byCategory2)
  })
})

describe('getTokensForCategory', () => {
  it('returns tokens for valid category', () => {
    const cTokens = getTokensForCategory('c')

    expect(Array.isArray(cTokens)).toBe(true)
    expect(cTokens).toHaveLength(3)
  })

  it('returns undefined for invalid category', () => {
    const tokens = getTokensForCategory('invalid')

    expect(tokens).toBeUndefined()
  })

  it('returns correct tokens for each category', () => {
    const cTokens = getTokensForCategory('c')
    const tTokens = getTokensForCategory('t')
    const chartTokens = getTokensForCategory('chart')
    const lTokens = getTokensForCategory('l')

    expect(cTokens?.length).toBe(3)
    expect(tTokens?.length).toBe(2)
    expect(chartTokens?.length).toBe(1)
    expect(lTokens?.length).toBe(1)
  })
})

describe('filterTokens', () => {
  const testTokens = [
    {
      name: '--pf-v6-c-alert--BackgroundColor',
      value: '#fff',
      var: 'var(--pf-v6-c-alert--BackgroundColor)',
    },
    {
      name: '--pf-v6-c-button--Color',
      value: '#000',
      var: 'var(--pf-v6-c-button--Color)',
    },
    {
      name: '--pf-v6-c-card--BackgroundColor',
      value: '#f5f5f5',
      var: 'var(--pf-v6-c-card--BackgroundColor)',
    },
  ]

  it('returns all tokens when filter is empty', () => {
    const filtered = filterTokens(testTokens, '')

    expect(filtered).toEqual(testTokens)
  })

  it('filters tokens by substring match', () => {
    const filtered = filterTokens(testTokens, 'alert')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toContain('alert')
  })

  it('filter is case-insensitive', () => {
    const filtered = filterTokens(testTokens, 'ALERT')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toContain('alert')
  })

  it('returns multiple matches', () => {
    const filtered = filterTokens(testTokens, 'BackgroundColor')

    expect(filtered).toHaveLength(2)
    filtered.forEach((token) => {
      expect(token.name).toContain('BackgroundColor')
    })
  })

  it('returns empty array when no matches', () => {
    const filtered = filterTokens(testTokens, 'nonexistent')

    expect(filtered).toHaveLength(0)
  })

  it('handles partial matches', () => {
    const filtered = filterTokens(testTokens, 'c-c')

    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toContain('c-card')
  })
})

describe('filterTokensByCategory', () => {
  const testTokensByCategory = {
    c: [
      {
        name: '--pf-v6-c-alert--Color',
        value: '#000',
        var: 'var(--pf-v6-c-alert--Color)',
      },
      {
        name: '--pf-v6-c-button--Color',
        value: '#fff',
        var: 'var(--pf-v6-c-button--Color)',
      },
    ],
    t: [
      {
        name: '--pf-v6-t-global--color--100',
        value: '#f0f0f0',
        var: 'var(--pf-v6-t-global--color--100)',
      },
    ],
    chart: [
      {
        name: '--pf-v6-chart-global--Fill',
        value: '#06c',
        var: 'var(--pf-v6-chart-global--Fill)',
      },
    ],
  }

  it('returns all categories when filter is empty', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, '')

    expect(filtered).toEqual(testTokensByCategory)
  })

  it('filters across all categories', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, 'alert')

    expect(Object.keys(filtered)).toHaveLength(1)
    expect(filtered).toHaveProperty('c')
    expect(filtered.c).toHaveLength(1)
    expect(filtered.c[0].name).toContain('alert')
  })

  it('excludes categories with no matches', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, 'button')

    expect(Object.keys(filtered)).toHaveLength(1)
    expect(filtered).toHaveProperty('c')
    expect(filtered).not.toHaveProperty('t')
    expect(filtered).not.toHaveProperty('chart')
  })

  it('returns empty object when no matches', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, 'nonexistent')

    expect(Object.keys(filtered)).toHaveLength(0)
  })

  it('filter is case-insensitive', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, 'GLOBAL')

    expect(Object.keys(filtered).length).toBeGreaterThan(0)
  })

  it('can match tokens in multiple categories', () => {
    const filtered = filterTokensByCategory(testTokensByCategory, 'global')

    expect(filtered).toHaveProperty('t')
    expect(filtered).toHaveProperty('chart')
  })
})
