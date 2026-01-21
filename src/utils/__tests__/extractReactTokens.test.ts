import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { extractReactTokens } from '../extractReactTokens'

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
}))

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
}))

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

// Mock process.cwd
const originalCwd = process.cwd
beforeAll(() => {
  process.cwd = jest.fn(() => '/test/project')
})

afterAll(() => {
  process.cwd = originalCwd
})

describe('extractReactTokens', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset console methods
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('CSS prefix to token prefix conversion', () => {
    it('converts single CSS prefix correctly', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([])

      await extractReactTokens('pf-v6-c-accordion')

      expect(join).toHaveBeenCalledWith(
        '/test/project',
        'node_modules',
        '@patternfly',
        'react-tokens',
        'dist',
        'esm',
      )
    })

    it('converts array of CSS prefixes correctly', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([])

      await extractReactTokens(['pf-v6-c-accordion', 'pf-v6-c-button'])

      expect(join).toHaveBeenCalledWith(
        '/test/project',
        'node_modules',
        '@patternfly',
        'react-tokens',
        'dist',
        'esm',
      )
    })

    it('handles CSS prefix without pf-v6- prefix', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([])

      await extractReactTokens('c-accordion')

      expect(join).toHaveBeenCalled()
    })
  })

  describe('directory existence check', () => {
    it('returns empty array when tokens directory does not exist', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(false)

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Tokens directory not found'),
      )
      expect(readdir).not.toHaveBeenCalled()
    })

    it('returns empty array when tokens directory exists', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([])

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
      expect(readdir).toHaveBeenCalled()
    })
  })

  describe('file filtering', () => {
    it('filters out non-JS files', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_accordion.ts',
        'c_accordion.json',
        'c_accordion.css',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test" };',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(readFile).toHaveBeenCalledTimes(1)
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('c_accordion__toggle_FontFamily.js'),
        'utf8',
      )
    })

    it('filters out componentIndex.js', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'componentIndex.js',
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test" };',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(readFile).toHaveBeenCalledTimes(1)
      expect(readFile).not.toHaveBeenCalledWith(
        expect.stringContaining('componentIndex.js'),
        expect.anything(),
      )
    })

    it('filters out main component file (e.g., c_accordion.js)', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion.js',
        'c_accordion__toggle_FontFamily.js',
        'c_accordion__header_BackgroundColor.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test" };',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(readFile).toHaveBeenCalledTimes(2)
      expect(readFile).not.toHaveBeenCalledWith(
        expect.stringContaining('c_accordion.js'),
        expect.anything(),
      )
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('c_accordion__toggle_FontFamily.js'),
        'utf8',
      )
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('c_accordion__header_BackgroundColor.js'),
        'utf8',
      )
    })

    it('includes files that start with token prefix but are not the main component file', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_accordion__header_BackgroundColor.js',
        'c_accordion__section_PaddingTop.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test" };',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(readFile).toHaveBeenCalledTimes(3)
    })

    it('handles multiple prefixes and matches files for any prefix', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_button__primary_BackgroundColor.js',
        'c_other_component.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test" };',
      )

      const result = await extractReactTokens([
        'pf-v6-c-accordion',
        'pf-v6-c-button',
      ])

      expect(readFile).toHaveBeenCalledTimes(2)
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('c_accordion__toggle_FontFamily.js'),
        'utf8',
      )
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('c_button__primary_BackgroundColor.js'),
        'utf8',
      )
    })
  })

  describe('token extraction from files', () => {
    it('extracts token object from valid file content', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const c_accordion_toggle_FontFamily = { "name": "c-accordion-toggle-FontFamily", "value": "1rem", "var": "--pf-v6-c-accordion--toggle--FontFamily"\n};',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([
        {
          name: 'c-accordion-toggle-FontFamily',
          value: '1rem',
          var: '--pf-v6-c-accordion--toggle--FontFamily',
        },
      ])
    })

    it('extracts multiple token objects from multiple files', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_accordion__header_BackgroundColor.js',
      ])
      ;(readFile as jest.Mock)
        .mockResolvedValueOnce(
          'export const token1 = { "name": "c-accordion-toggle-FontFamily", "value": "1rem", "var": "--pf-v6-c-accordion--toggle--FontFamily"\n};',
        )
        .mockResolvedValueOnce(
          'export const token2 = { "name": "c-accordion-header-BackgroundColor", "value": "#fff", "var": "--pf-v6-c-accordion--header--BackgroundColor"\n};',
        )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toHaveLength(2)
      expect(result).toEqual([
        {
          name: 'c-accordion-header-BackgroundColor',
          value: '#fff',
          var: '--pf-v6-c-accordion--header--BackgroundColor',
        },
        {
          name: 'c-accordion-toggle-FontFamily',
          value: '1rem',
          var: '--pf-v6-c-accordion--toggle--FontFamily',
        },
      ])
    })

    it('handles file content with multiline object definition', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(`export const token = {
  "name": "c-accordion-toggle-FontFamily",
  "value": "1rem",
  "var": "--pf-v6-c-accordion--toggle--FontFamily"
};`)

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([
        {
          name: 'c-accordion-toggle-FontFamily',
          value: '1rem',
          var: '--pf-v6-c-accordion--toggle--FontFamily',
        },
      ])
    })

    it('handles file content with whitespace and comments', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        '// Some comment\nexport const token = { "name": "test", "value": "test", "var": "--test"\n};// Another comment',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([
        {
          name: 'test',
          value: 'test',
          var: '--test',
        },
      ])
    })

    it('skips files that do not match the export pattern', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_accordion__header_BackgroundColor.js',
      ])
      ;(readFile as jest.Mock)
        .mockResolvedValueOnce('const token = { "name": "test" };') // No export
        .mockResolvedValueOnce(
          'export const token = { "name": "test", "value": "test", "var": "--test"\n};',
        )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('test')
    })

    it('validates token object has required properties', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test" };', // Missing value and var
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
    })

    it('validates token object properties are strings', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": 123, "value": "test", "var": "--test" };', // name is not a string
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
    })
  })

  describe('error handling', () => {
    it('handles file read errors gracefully', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
        'c_accordion__header_BackgroundColor.js',
      ])
      ;(readFile as jest.Mock)
        .mockRejectedValueOnce(new Error('Permission denied'))
        .mockResolvedValueOnce(
          'export const token = { "name": "test", "value": "test", "var": "--test"\n};',
        )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to read file'),
        expect.any(Error),
      )
      expect(result).toHaveLength(1)
    })

    it('handles object parsing errors gracefully', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { invalid syntax\n};', // Invalid JavaScript
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse object'),
        expect.any(Error),
      )
      expect(result).toEqual([])
    })

    it('handles readdir errors gracefully', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockRejectedValue(new Error('Directory read failed'))

      await expect(extractReactTokens('pf-v6-c-accordion')).rejects.toThrow(
        'Directory read failed',
      )
    })
  })

  describe('sorting', () => {
    it('sorts tokens by name alphabetically', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__z_token.js',
        'c_accordion__a_token.js',
        'c_accordion__m_token.js',
      ])
      ;(readFile as jest.Mock)
        .mockResolvedValueOnce(
          'export const token1 = { "name": "z-token", "value": "test", "var": "--test"\n};',
        )
        .mockResolvedValueOnce(
          'export const token2 = { "name": "a-token", "value": "test", "var": "--test"\n};',
        )
        .mockResolvedValueOnce(
          'export const token3 = { "name": "m-token", "value": "test", "var": "--test"\n};',
        )

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([
        { name: 'a-token', value: 'test', var: '--test' },
        { name: 'm-token', value: 'test', var: '--test' },
        { name: 'z-token', value: 'test', var: '--test' },
      ])
    })
  })

  describe('edge cases', () => {
    it('handles empty file list', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([])

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
    })

    it('handles files with no matching prefix', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'other_component__token.js',
        'unrelated_file.js',
      ])

      const result = await extractReactTokens('pf-v6-c-accordion')

      expect(result).toEqual([])
      expect(readFile).not.toHaveBeenCalled()
    })

    it('handles CSS prefix with multiple hyphens', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_data_list__item_row_BackgroundColor.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token = { "name": "test", "value": "test", "var": "--test"\n};',
      )

      const result = await extractReactTokens('pf-v6-c-data-list')

      expect(readFile).toHaveBeenCalled()
      expect(result).toHaveLength(1)
    })

    it('handles file content with multiple export statements', async () => {
      ;(existsSync as jest.Mock).mockReturnValue(true)
      ;(readdir as jest.Mock).mockResolvedValue([
        'c_accordion__toggle_FontFamily.js',
      ])
      ;(readFile as jest.Mock).mockResolvedValue(
        'export const token1 = { "name": "first", "value": "test", "var": "--test"\n};export const token2 = { "name": "second", "value": "test", "var": "--test"\n};',
      )

      const result = await extractReactTokens('pf-v6-c-accordion')

      // Should only extract the first matching export
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('first')
    })
  })
})
