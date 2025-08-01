import { writeFile } from 'fs/promises'
import { glob } from 'glob'
import { buildPropsData } from '../buildPropsData'
import { getConfig } from '../getConfig'
import { tsDocgen } from '../tsDocGen'

jest.mock('fs/promises')
jest.mock('glob')
jest.mock('../getConfig')
jest.mock('../tsDocGen')

// suppress console logs so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

const validConfigResponse = {
  propsGlobs: [
    {
      include: ['**/include/files/*', '**/include/other/files/*'],
      exclude: ['**/exclude/files/*'],
    },
    { include: ['**/one/more/include/*'], exclude: [] },
  ],
  outputDir: '/output/dir',
}

const sharedPropData = [
  {
    name: 'firstProp',
    type: 'firstPropType',
    description: 'this is the first prop',
    required: false,
    defaultValue: 'firstDefaultValue',
    hide: false,
  },
  {
    name: 'secondProp',
    type: 'secondPropType',
    description: 'this is the second prop',
    required: false,
    defaultValue: 'secondDefaultValue',
    hide: false,
  },
]

const validTsDocGenResponseOne = [
  {
    name: 'ComponentOne',
    description: 'This is the first component',
    props: sharedPropData,
  },
  {
    name: 'ComponentTwo',
    description: 'This is the second component',
    props: sharedPropData,
  },
]

const validTsDocGenResponseTwo = [
  {
    name: 'ComponentThree',
    description: 'This is the third component',
    props: sharedPropData,
  },
]

const propsData = {
  ComponentOne: {
    name: 'ComponentOne',
    description: 'This is the first component',
    props: sharedPropData,
  },
  ComponentTwo: {
    name: 'ComponentTwo',
    description: 'This is the second component',
    props: sharedPropData,
  },
  ComponentThree: {
    name: 'ComponentThree',
    description: 'This is the third component',
    props: sharedPropData,
  },
}

it('should call getConfig with the passed config file location', async () => {
  await buildPropsData('/root/', '/config', false)

  expect(getConfig).toHaveBeenCalledWith('/config')
})

it('should not proceed if config is not found', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(undefined)

  await buildPropsData('/root/', '/config', false)

  expect(writeFile).not.toHaveBeenCalled()
})

it('should send an error to the console if the config file does not have a propsGlobs entry', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue({ foo: 'bar' })

  const mockConsoleError = jest.fn()
  jest.spyOn(console, 'error').mockImplementation(mockConsoleError)

  await buildPropsData('/root/', '/config', false)

  expect(mockConsoleError).toHaveBeenCalledWith('No props data found in config')
  expect(writeFile).not.toHaveBeenCalled()
})

it('should call glob with the propGlobs in the config file and the cwd set to the root dir', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(validConfigResponse)
  ;(glob as unknown as jest.Mock).mockResolvedValue(['files/one', 'files/two'])
  ;(tsDocgen as jest.Mock).mockResolvedValue(validTsDocGenResponseOne)

  await buildPropsData('/root/', '/config', false)

  expect(glob).toHaveBeenNthCalledWith(
    1,
    ['**/include/files/*', '**/include/other/files/*'],
    { cwd: '/root/', ignore: ['**/exclude/files/*'] },
  )
  expect(glob).toHaveBeenNthCalledWith(2, ['**/one/more/include/*'], {
    cwd: '/root/',
    ignore: [],
  })
  expect(glob).toHaveBeenCalledTimes(2)
})

it('should call tsDocGen with each file that glob returns', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(validConfigResponse)
  ;(glob as unknown as jest.Mock).mockResolvedValueOnce([
    'files/one',
    'files/two',
  ])
  ;(glob as unknown as jest.Mock).mockResolvedValueOnce([
    'files/three',
    'files/four',
  ])
  ;(tsDocgen as jest.Mock).mockReset()
  ;(tsDocgen as jest.Mock).mockResolvedValue(validTsDocGenResponseOne)

  await buildPropsData('/root/', '/config', false)

  expect(tsDocgen).toHaveBeenNthCalledWith(1, 'files/one')
  expect(tsDocgen).toHaveBeenNthCalledWith(2, 'files/two')
  expect(tsDocgen).toHaveBeenNthCalledWith(3, 'files/three')
  expect(tsDocgen).toHaveBeenNthCalledWith(4, 'files/four')
  expect(tsDocgen).toHaveBeenCalledTimes(4)
})

it('should call writeFile with the returned prop data in JSON form', async () => {
  ;(getConfig as jest.Mock).mockResolvedValue(validConfigResponse)
  ;(glob as unknown as jest.Mock).mockResolvedValueOnce(['files/one'])
  ;(glob as unknown as jest.Mock).mockResolvedValueOnce(['files/two'])
  ;(tsDocgen as jest.Mock).mockResolvedValueOnce(validTsDocGenResponseOne)
  ;(tsDocgen as jest.Mock).mockResolvedValueOnce(validTsDocGenResponseTwo)
  ;(writeFile as jest.Mock).mockReset()

  await buildPropsData('/root/', '/config', false)

  expect(writeFile).toHaveBeenCalledWith(
    '/output/dir/props.json',
    JSON.stringify(propsData),
  )
})
