import { symlink } from 'fs/promises'
import { symLinkConfig } from '../symLinkConfig'

jest.mock('fs/promises')

// suppress console.log so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

it('should create a symlink successfully', async () => {
  ;(symlink as jest.Mock).mockResolvedValue(undefined)

  await symLinkConfig('/astro', '/consumer')

  expect(symlink).toHaveBeenCalledWith(
    '/consumer/pf-docs.config.mjs',
    '/astro/pf-docs.config.mjs',
  )
})

it('should log an error if symlink creation fails', async () => {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {})

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

  await symLinkConfig('/astro', '/consumer')

  expect(consoleLogSpy).toHaveBeenCalledWith(
    `Symlink to /consumer/pf-docs.config.mjs in /astro created`,
  )
})
