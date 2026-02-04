/* eslint-disable camelcase -- mock data mirrors @patternfly/react-tokens componentIndex structure */
import { extractReactTokens } from '../extractReactTokens'

const mockComponentIndex: Record<
  string,
  Record<string, Record<string, { name: string; value: string; values?: string[] }>>
> = {
  c_accordion: {
    '.pf-v6-c-accordion': {
      c_accordion__toggle_FontFamily: {
        name: '--pf-v6-c-accordion--toggle--FontFamily',
        value: '1rem',
        values: ['--pf-t--global--font--size--200', '1rem'],
      },
      c_accordion__header_BackgroundColor: {
        name: '--pf-v6-c-accordion--header--BackgroundColor',
        value: '#fff',
      },
      c_accordion__expandable_content_m_fixed_MaxHeight: {
        name: '--pf-v6-c-accordion__expandable-content--m-fixed--MaxHeight',
        value: '9.375rem',
      },
    },
  },
  c_button: {
    '.pf-v6-c-button': {
      c_button__primary_BackgroundColor: {
        name: '--pf-v6-c-button--primary--BackgroundColor',
        value: '#0066cc',
      },
    },
  },
  c_data_list: {
    '.pf-v6-c-data-list': {
      c_data_list__item_row_BackgroundColor: {
        name: '--pf-v6-c-data-list__item--row--BackgroundColor',
        value: '#ffffff',
      },
    },
  },
  c_empty: {},
}

jest.mock('@patternfly/react-tokens/dist/esm/componentIndex', () => mockComponentIndex)

describe('extractReactTokens', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  describe('CSS prefix to token prefix conversion', () => {
    it('converts single CSS prefix correctly', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result.length).toBeGreaterThan(0)
      expect(result.every((t) => t.name.startsWith('--pf-v6-c-accordion'))).toBe(
        true,
      )
    })

    it('converts array of CSS prefixes correctly', async () => {
      const result = await extractReactTokens([
        'pf-v6-c-accordion',
        'pf-v6-c-button',
      ])

      const accordionTokens = result.filter((t) =>
        t.name.includes('accordion'),
      )
      const buttonTokens = result.filter((t) => t.name.includes('button'))
      expect(accordionTokens.length).toBeGreaterThan(0)
      expect(buttonTokens.length).toBeGreaterThan(0)
    })

    it('handles CSS prefix without pf-v6- prefix', async () => {
      const result = await extractReactTokens('c-accordion')

      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('component resolution', () => {
    it('returns empty array when component does not exist in index', async () => {
      const result = await extractReactTokens('pf-v6-c-nonexistent')

      expect(result).toEqual([])
    })

    it('extracts tokens from componentIndex', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toContainEqual({
        name: '--pf-v6-c-accordion--toggle--FontFamily',
        value: '1rem',
        var: 'var(--pf-v6-c-accordion--toggle--FontFamily)',
      })
      expect(result).toContainEqual({
        name: '--pf-v6-c-accordion--header--BackgroundColor',
        value: '#fff',
        var: 'var(--pf-v6-c-accordion--header--BackgroundColor)',
      })
    })
  })

  describe('token filtering', () => {
    it('filters tokens by prefix for subcomponents', async () => {
      const result = await extractReactTokens(
        'pf-v6-c-accordion__expandable-content',
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        name: '--pf-v6-c-accordion__expandable-content--m-fixed--MaxHeight',
        value: '9.375rem',
        var: 'var(--pf-v6-c-accordion__expandable-content--m-fixed--MaxHeight)',
      })
    })

    it('handles multiple prefixes and returns union of tokens', async () => {
      const result = await extractReactTokens([
        'pf-v6-c-accordion',
        'pf-v6-c-button',
      ])

      const accordionTokens = result.filter((t) =>
        t.name.includes('accordion'),
      )
      const buttonTokens = result.filter((t) => t.name.includes('button'))
      expect(accordionTokens.length).toBeGreaterThan(0)
      expect(buttonTokens.length).toBeGreaterThan(0)
    })

    it('handles files with no matching prefix', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      const otherTokens = result.filter(
        (t) =>
          !t.name.includes('accordion') && !t.name.includes('accordion'),
      )
      expect(otherTokens).toHaveLength(0)
    })
  })

  describe('token extraction', () => {
    it('extracts token object with correct format', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual(
        expect.arrayContaining([
          {
            name: '--pf-v6-c-accordion--toggle--FontFamily',
            value: '1rem',
            var: 'var(--pf-v6-c-accordion--toggle--FontFamily)',
          },
        ]),
      )
    })

    it('deduplicates tokens that appear in multiple selectors', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      const toggleFontFamily = result.filter(
        (t) => t.name === '--pf-v6-c-accordion--toggle--FontFamily',
      )
      expect(toggleFontFamily).toHaveLength(1)
    })

    it('validates token object has required properties', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result.every((t) => t.name && t.value && t.var)).toBe(true)
    })
  })

  describe('sorting', () => {
    it('sorts tokens by name alphabetically', async () => {
      const result = await extractReactTokens('pf-v6-c-accordion')

      const sorted = [...result].sort((a, b) => a.name.localeCompare(b.name))
      expect(result).toEqual(sorted)
    })
  })

  describe('edge cases', () => {
    it('handles empty component', async () => {
      const result = await extractReactTokens('pf-v6-c-empty')

      expect(result).toEqual([])
    })

    it('handles CSS prefix with multiple hyphens', async () => {
      const result = await extractReactTokens('pf-v6-c-data-list')

      expect(result).toHaveLength(1)
      expect(result[0].name).toContain('data-list')
    })
  })
})
