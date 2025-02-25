import { getConfig } from '../getConfig'
import { resolve } from 'path'

it('should return the config when pf-docs.config.mjs exists', async () => {
  const config = await getConfig(resolve('./cli/testData/good.config.js'))
  expect(config).toEqual({
    config: {
      content: [
        {
          base: 'base-path',
          packageName: 'package-name',
          pattern: 'pattern',
          name: 'name',
        },
      ],
    },
  })
})

it('should return undefined and log error when pf-docs.config.mjs does not exist', async () => {
  const consoleErrorMock = jest.fn()

  jest.spyOn(console, 'error').mockImplementation(consoleErrorMock)

  const config = await getConfig('foo')
  expect(config).toBeUndefined()
  expect(consoleErrorMock).toHaveBeenCalledWith(
    'pf-docs.config.mjs not found, have you created it at the root of your package?',
  )
})
