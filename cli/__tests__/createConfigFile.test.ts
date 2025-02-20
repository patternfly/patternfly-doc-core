/* eslint-disable no-console */

import { createConfigFile } from '../createConfigFile.ts'
import { access, copyFile } from 'fs/promises'

jest.mock('fs/promises')

afterEach(() => {
  jest.clearAllMocks()
})

// suppress console calls so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

it('should log a message and not call copyFile if the config file already exists', async () => {
  ;(access as jest.Mock).mockResolvedValue(true)

  await createConfigFile('/astro', '/consumer')

  expect(copyFile).not.toHaveBeenCalled()
  expect(console.log).toHaveBeenCalledWith(
    'pf-docs.config.js already exists, proceeding to next setup step',
  )
})

it('should copy the template file if the config file does not exist', async () => {
  ;(access as jest.Mock).mockRejectedValue(new Error())
  ;(copyFile as jest.Mock).mockResolvedValue(undefined)

  const from = '/astro/cli/templates/pf-docs.config.js'
  const to = '/consumer/pf-docs.config.js'

  await createConfigFile('/astro', '/consumer')

  expect(copyFile).toHaveBeenCalledWith(from, to)
  expect(console.log).toHaveBeenCalledWith(
    'pf-docs.config.js has been created in /consumer',
  )
})

it('should log an error if copyFile fails', async () => {
  ;(access as jest.Mock).mockRejectedValue(new Error())
  ;(copyFile as jest.Mock).mockRejectedValue(new Error('copy failed'))

  await createConfigFile('/astro', '/consumer')

  expect(console.error).toHaveBeenCalledWith(
    'Error creating pf-docs.config.js in /consumer.',
  )
  expect(console.error).toHaveBeenCalledWith(new Error('copy failed'))
})
