import { symlink, rm } from 'fs/promises'
import { symLinkConfig } from '../symLinkConfig'
import { fileExists } from '../fileExists'

jest.mock('fs/promises')
jest.mock('../fileExists')

// suppress console.log so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

it('should create a symlink successfully when one does not exist', async () => {
  ;(fileExists as jest.Mock).mockResolvedValue(false)
  ;(symlink as jest.Mock).mockResolvedValue(undefined)

  await symLinkConfig('/astro', '/consumer')

  expect(symlink).toHaveBeenCalledWith(
    '/consumer/pf-docs.config.mjs',
    '/astro/pf-docs.config.mjs',
  )
})

it('should not try to remove a file that does not exist', async () => {
  ;(fileExists as jest.Mock).mockResolvedValue(false)
  ;(symlink as jest.Mock).mockResolvedValue(undefined)

  await symLinkConfig('/astro', '/consumer')

  expect(rm).not.toHaveBeenCalled()
})

it('should remove existing file before creating symlink', async () => {
  ;(fileExists as jest.Mock).mockResolvedValue(true)
  ;(rm as jest.Mock).mockResolvedValue(undefined)
  ;(symlink as jest.Mock).mockResolvedValue(undefined)

  await symLinkConfig('/astro', '/consumer')

  expect(fileExists).toHaveBeenCalledWith('/astro/pf-docs.config.mjs')
  expect(rm).toHaveBeenCalledWith('/astro/pf-docs.config.mjs')
  expect(symlink).toHaveBeenCalledWith(
    '/consumer/pf-docs.config.mjs',
    '/astro/pf-docs.config.mjs',
  )
})

it('should log an error if symlink creation fails', async () => {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {})

  ;(fileExists as jest.Mock).mockResolvedValue(false)
  const error = new Error('Symlink creation failed')
  ;(symlink as jest.Mock).mockRejectedValue(error)

  await symLinkConfig('/astro', '/consumer')

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    `Error creating symlink to /consumer/pf-docs.config.mjs in /astro`,
    error,
  )
})

it('should log a success message after creating the symlink', async () => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

  ;(fileExists as jest.Mock).mockResolvedValue(false)
  ;(symlink as jest.Mock).mockResolvedValue(undefined)

  await symLinkConfig('/astro', '/consumer')

  expect(consoleLogSpy).toHaveBeenCalledWith(
    `Symlink to /consumer/pf-docs.config.mjs in /astro created`,
  )
})
