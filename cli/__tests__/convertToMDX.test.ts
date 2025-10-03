import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { convertToMDX } from '../convertToMDX.ts'

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  access: jest.fn().mockResolvedValue(undefined), // Mock access to always resolve (file exists)
}))

jest.mock('glob', () => ({
  glob: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

it('should convert a file with no examples', async () => {
  const mockContent = '# Test Content\nSome text here'
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', mockContent)
})

it('should convert a file with JS/TS examples', async () => {
  const mockContent = "# Test Content\n```ts file='./Example.ts'\n```"
  const expectedContent =
    '# Test Content\n\nimport Example from "./Example.ts?raw"\n\n<LiveExample src={Example} />'
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
})

it('should convert a file with HTML examples', async () => {
  const mockContent = '# Test Content\n```html\n<div>Test HTML</div>\n```'
  const expectedContent =
    "# Test Content\n\nimport Example1 from './Example1.html?raw'\n\n<LiveExample html={Example1} />"
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining('Example1.html'),
    '<div>Test HTML</div>',
  )
})

it('should handle multiple HTML examples in the same file', async () => {
  const mockContent =
    '# Test Content\n```html\n<div>First HTML</div>\n```\n```html\n<div>Second HTML</div>\n```'
  const expectedContent =
    "# Test Content\n\nimport Example1 from './Example1.html?raw'\n\n<LiveExample html={Example1} />\n\nimport Example2 from './Example2.html?raw'\n\n<LiveExample html={Example2} />"
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining('Example1.html'),
    '<div>First HTML</div>',
  )
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining('Example2.html'),
    '<div>Second HTML</div>',
  )
})

it('should handle multiple files', async () => {
  const mockContent1 = '# Test Content 1\n```html\n<div>Test HTML 1</div>\n```'
  const mockContent2 = '# Test Content 2\n```html\n<div>Test HTML 2</div>\n```'
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test1.md', 'test2.md'])
  ;(readFile as jest.Mock)
    .mockResolvedValueOnce(mockContent1)
    .mockResolvedValueOnce(mockContent2)

  await convertToMDX('*.md')

  expect(writeFile).toHaveBeenCalledTimes(4) // 2 MDX files + 2 HTML files
  expect(writeFile).toHaveBeenCalledWith(
    'test1.mdx',
    expect.stringContaining('Example1'),
  )
  expect(writeFile).toHaveBeenCalledWith(
    'test2.mdx',
    expect.stringContaining('Example1'),
  )
})

it('should remove noLive tags from code blocks', async () => {
  const mockContent = "# Test Content\n```noLive\nconst test = 'test';\n```"
  const expectedContent = "# Test Content\n```\nconst test = 'test';\n```"
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
})

it('should remove existing imports but preserve CSS imports', async () => {
  const mockContent = `import { something } from 'somewhere'
import './styles.css'
import { other } from 'other-package'
import './other-styles.css'
# Test Content
\`\`\`html
<div>Test HTML</div>
\`\`\``
  const expectedContent = `import './styles.css'
import './other-styles.css'
# Test Content

import Example1 from './Example1.html?raw'

<LiveExample html={Example1} />`
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
})

it('should convert HTML comments in MD content to MDX format', async () => {
  const mockContent = '# Test Content\n<!-- This is a comment in the MD content -->\nSome text here\n<!-- Another comment\nspanning multiple lines -->'
  const expectedContent = '# Test Content\n{/* This is a comment in the MD content */}\nSome text here\n{/* Another comment\nspanning multiple lines */}'
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedContent)
})

it('should preserve HTML comments in HTML files', async () => {
  const mockContent = '# Test Content\n```html\n<!-- This is a comment -->\n<div>Test HTML</div>\n<!-- Another comment\nspanning multiple lines -->\n```'
  const expectedMDXContent = '# Test Content\n\nimport Example1 from \'./Example1.html?raw\'\n\n<LiveExample html={Example1} />'
  const expectedHTMLContent = '<!-- This is a comment -->\n<div>Test HTML</div>\n<!-- Another comment\nspanning multiple lines -->'
  ;(glob as unknown as jest.Mock).mockResolvedValue(['test.md'])
  ;(readFile as jest.Mock).mockResolvedValue(mockContent)

  await convertToMDX('test.md')

  expect(writeFile).toHaveBeenCalledWith('test.mdx', expectedMDXContent)
  expect(writeFile).toHaveBeenCalledWith(
    expect.stringContaining('Example1.html'),
    expectedHTMLContent,
  )
})

