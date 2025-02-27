import { readFile, writeFile } from 'fs/promises'
import { setFsRootDir } from '../setFsRootDir'

jest.mock('fs/promises')

// suppress console.log so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

it('should attempt to read the astro config file', async () => {
  ;(readFile as jest.Mock).mockResolvedValue("{ fs: { allow: ['/bar/'] } }")

  await setFsRootDir('/foo/', '/bar')

  expect(readFile).toHaveBeenCalledWith('/foo/astro.config.mjs', 'utf8')
})

it('should not modify the file if the default allow list is not present', async () => {
  ;(readFile as jest.Mock).mockResolvedValue("{ fs: { allow: ['/bar/'] } }")

  await setFsRootDir('/foo/', '/bar')

  expect(writeFile).not.toHaveBeenCalled()
})

it('should modify the file if the default allow list is present', async () => {
  ;(readFile as jest.Mock).mockResolvedValue("{ fs: { allow: ['./'] } }")

  await setFsRootDir('/foo/', '/bar')

  expect(writeFile).toHaveBeenCalledWith(
    '/foo/astro.config.mjs',
    "{ fs: { allow: ['/bar/'] } }",
  )
})

it('should log an error if writing the file fails', async () => {
  ;(readFile as jest.Mock).mockResolvedValue("{ fs: { allow: ['./'] } }")
  ;(writeFile as jest.Mock).mockRejectedValue(new Error('write error'))
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {})

  await setFsRootDir('/foo/', '/bar')

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    `Error setting the server allow list in /foo/`,
    expect.any(Error),
  )
})

it('should log a success message after attempting to write the file', async () => {
  ;(readFile as jest.Mock).mockResolvedValue("{ fs: { allow: ['./'] } }")
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

  await setFsRootDir('/foo/', '/bar')

  expect(consoleLogSpy).toHaveBeenCalledWith('fs value set created')
})
