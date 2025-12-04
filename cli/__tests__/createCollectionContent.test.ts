import { createCollectionContent } from '../createCollectionContent'
import { getConfig } from '../getConfig'
import { writeFile } from 'fs/promises'
import { existsSync } from 'fs'

jest.mock('../getConfig')
jest.mock('fs/promises')
jest.mock('fs')

// suppress console.log so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

beforeEach(() => {
  jest.clearAllMocks()
})

it('should call getConfig with the passed config file location', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
  ;(getConfig as jest.Mock).mockResolvedValue(undefined)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  expect(getConfig).toHaveBeenCalledWith('/config/dir/pf-docs.config.mjs')
})

it('should not proceed if config is not found', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  expect(mockConsoleError).toHaveBeenCalledWith(
    'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
  )
  expect(writeFile).not.toHaveBeenCalled()
})

it('should log error if content is not found in config', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue({ foo: 'bar' })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  expect(mockConsoleError).toHaveBeenCalledWith('No content found in config')
  expect(writeFile).not.toHaveBeenCalled()
})

it('should call writeFile with the expected file location and content without throwing any errors', async () => {
  const mockContent = [
    { name: 'test', base: 'src/docs', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.'
  })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  const expectedContent = [
    { name: 'test', base: '/config/dir/src/docs', pattern: '**/*.md', version: 'v6' }
  ]

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify(expectedContent)}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})

it('should log error if writeFile throws an error', async () => {
  const mockContent = [
    { name: 'test', base: 'src/docs', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.'
  })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  const error = new Error('error')
  ;(writeFile as jest.Mock).mockRejectedValue(error)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  expect(mockConsoleError).toHaveBeenCalledWith(
    'Error writing content file',
    error,
  )
})

it('should log all verbose messages when run in verbose mode', async () => {
  const mockContent = [
    { name: 'docs', base: 'src/docs', pattern: '**/*.md' },
    { name: 'components', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '../'
  })
  ;(existsSync as jest.Mock).mockReturnValue(true)
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', true)

  // Check that all verbose logs were called
  expect(mockConsoleLog).toHaveBeenCalledWith('configuration content entry: ', mockContent, '\n')
  expect(mockConsoleLog).toHaveBeenCalledWith('Creating content file', '/foo/src/content.ts', '\n')
  expect(mockConsoleLog).toHaveBeenCalledWith('repoRootDir: ', '/config', '\n')
  
  // For the base entry
  expect(mockConsoleLog).toHaveBeenCalledWith('relative path: ', 'src/docs')
  expect(mockConsoleLog).toHaveBeenCalledWith('absolute path: ', '/config/dir/src/docs', '\n')
  
  // For the packageName entry
  expect(mockConsoleLog).toHaveBeenCalledWith('looking for package in ', '/config/dir/node_modules', '\n')
  expect(mockConsoleLog).toHaveBeenCalledWith('found package at ', '/config/dir/node_modules/@patternfly/react-core', '\n')
  
  // Final log
  expect(mockConsoleLog).toHaveBeenCalledWith('Content file created')
})

it('should log verbose message when no package name or base path is found', async () => {
  const mockContent = [
    { name: 'invalid-entry', pattern: '**/*.md' } // no base or packageName
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.'
  })
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', true)

  expect(mockConsoleLog).toHaveBeenCalledWith(
    'no package name or base path found, skipping entry ',
    'invalid-entry',
    '\n',
  )
})

it('should log verbose message when package is not found and reaches repoRootDir', async () => {
  const mockContent = [
    { name: 'test', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.' // Same as configDir, so search will stop immediately
  })
  ;(existsSync as jest.Mock).mockReturnValue(false) // Package not found
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', true)

  expect(mockConsoleLog).toHaveBeenCalledWith('looking for package in ', '/config/dir/node_modules', '\n')
  expect(mockConsoleLog).toHaveBeenCalledWith('reached repoRootDir, stopping search')
})

it('should not log to the console when not run in verbose mode', async () => {
  const mockContent = [
    { name: 'test', base: 'src/docs', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.'
  })
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  expect(mockConsoleLog).not.toHaveBeenCalled()
})

it('should handle content with packageName by finding package in node_modules', async () => {
  const mockContent = [
    { name: 'test', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '.'
  })
  ;(existsSync as jest.Mock).mockReturnValue(true)
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  const expectedContent = [
    {
      base: '/config/dir/node_modules/@patternfly/react-core',
      name: 'test',
      packageName: '@patternfly/react-core',
      pattern: '**/*.md',
      version: 'v6'
    }
  ]

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify(expectedContent)}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})

it('should handle content with packageName when package is not found locally but found in parent directory', async () => {
  const mockContent = [
    { name: 'test', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '../../'
  })
  ;(existsSync as jest.Mock)
    .mockReturnValueOnce(false) // not found in /config/dir/node_modules
    .mockReturnValueOnce(true)  // found in /config/node_modules
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  const expectedContent = [
    {
      base: '/config/node_modules/@patternfly/react-core',
      name: 'test',
      packageName: '@patternfly/react-core',
      pattern: '**/*.md',
      version: 'v6'
    }
  ]

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify(expectedContent)}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})

it('should handle content with packageName when package is not found anywhere', async () => {
  const mockContent = [
    { name: 'test', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '../'
  })
  ;(existsSync as jest.Mock).mockReturnValue(false)
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  const expectedContent = [
    {
      base: null,
      name: 'test',
      packageName: '@patternfly/react-core',
      pattern: '**/*.md',
      version: 'v6'
    }
  ]

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify(expectedContent)}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})

it('should handle mixed content with both base and packageName entries', async () => {
  const mockContent = [
    { name: 'docs', base: 'src/docs', pattern: '**/*.md' },
    { name: 'components', packageName: '@patternfly/react-core', pattern: '**/*.md' }
  ]
  ;(getConfig as jest.Mock).mockResolvedValue({ 
    content: mockContent,
    repoRoot: '../'
  })
  ;(existsSync as jest.Mock).mockReturnValue(true)
  ;(writeFile as jest.Mock).mockResolvedValue(undefined)

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', '/config/dir/pf-docs.config.mjs', false)

  const expectedContent = [
    { name: 'docs', base: '/config/dir/src/docs', pattern: '**/*.md', version: 'v6' },
    {
      base: '/config/dir/node_modules/@patternfly/react-core',
      name: 'components',
      packageName: '@patternfly/react-core',
      pattern: '**/*.md',
      version: 'v6'
    }
  ]

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify(expectedContent)}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})
