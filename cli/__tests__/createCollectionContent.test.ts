import { createCollectionContent } from '../createCollectionContent'
import { getConfig } from '../getConfig'
import { writeFile } from 'fs/promises'

jest.mock('../getConfig')
jest.mock('fs/promises')

// suppress console.log so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

it('should call getConfig with the passed config file location', async () => {
  await createCollectionContent('/foo/', 'bar', false)

  expect(getConfig).toHaveBeenCalledWith('bar')
})

it('should not proceed if config is not found', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(undefined)

  await createCollectionContent('/foo/', 'bar', false)

  expect(writeFile).not.toHaveBeenCalled()
})

it('should log error if content is not found in config', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue({ foo: 'bar' })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', 'bar', false)

  expect(mockConsoleError).toHaveBeenCalledWith('No content found in config')
  expect(writeFile).not.toHaveBeenCalled()
})

it('should call writeFile with the expected file location and content without throwing any errors', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue({ content: { key: 'value' } })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await createCollectionContent('/foo/', 'bar', false)

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/src/content.ts',
    `export const content = ${JSON.stringify({ key: 'value' })}`,
  )
  expect(mockConsoleError).not.toHaveBeenCalled()
})

it('should log error if writeFile throws an error', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue({ content: { key: 'value' } })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  const error = new Error('error')
  ;(writeFile as jest.Mock).mockRejectedValue(error)

  await createCollectionContent('/foo/', 'bar', false)

  expect(mockConsoleError).toHaveBeenCalledWith(
    'Error writing content file',
    error,
  )
})

it('should log that content file was created when run in verbose mode', async () => {
  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', 'bar', true)

  expect(mockConsoleLog).toHaveBeenCalledWith('Content file created')
})

it('should not log that content file was created when not run in verbose mode', async () => {
  const mockConsoleLog = jest.fn()
  jest.spyOn(console, 'log').mockImplementation(mockConsoleLog)

  await createCollectionContent('/foo/', 'bar', false)

  expect(mockConsoleLog).not.toHaveBeenCalled()
})
