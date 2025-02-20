/* eslint-disable no-console */

import { updatePackageFile } from '../updatePackageFile'
import { copyFile, readFile, writeFile } from 'fs/promises'

jest.mock('fs/promises')

// suppress console calls so that it doesn't clutter the test output
jest.spyOn(console, 'log').mockImplementation(() => {})

const consumerPackageFilePath = '/consumer/package.json'
const templateFilePath = '/astro/cli/templates/package.json'
const docsCorePackageFilePath = '/astro/package.json'

beforeEach(() => {
  jest.clearAllMocks()
})

it('should update the package.json with new scripts and devDependencies', async () => {
  const docsCorePackageJson = {
    name: 'patternfly-doc-core',
    version: '1.0.0',
  }
  const packageJson = {
    scripts: {
      test: 'jest',
    },
    dependencies: {
      react: '1.0.0',
    },
    devDependencies: {
      jest: '1.0.0',
    },
  }
  const templateJson = {
    scripts: {
      start: 'patternfly-doc-core start',
    },
  }

  ;(readFile as jest.Mock).mockImplementation((path: string) => {
    if (path === docsCorePackageFilePath) {
      return Promise.resolve(JSON.stringify(docsCorePackageJson))
    } else if (path === consumerPackageFilePath) {
      return Promise.resolve(JSON.stringify(packageJson))
    } else if (path === templateFilePath) {
      return Promise.resolve(JSON.stringify(templateJson))
    }
    return Promise.reject(new Error('File not found'))
  })

  await updatePackageFile('/astro', '/consumer')

  expect(readFile).toHaveBeenCalledWith(docsCorePackageFilePath, 'utf8')
  expect(readFile).toHaveBeenCalledWith(consumerPackageFilePath, 'utf8')
  expect(readFile).toHaveBeenCalledWith(templateFilePath, 'utf8')
  expect(writeFile).toHaveBeenCalledWith(
    consumerPackageFilePath,
    JSON.stringify(
      {
        scripts: {
          test: 'jest',
          start: 'patternfly-doc-core start',
        },
        dependencies: {
          react: '1.0.0',
        },
        devDependencies: {
          jest: '1.0.0',
          'patternfly-doc-core': '^1.0.0',
        },
      },
      null,
      2,
    ),
  )

  expect(console.log).toHaveBeenCalledWith(
    `${consumerPackageFilePath} has been updated with new scripts and devDependencies.`,
  )
  expect(copyFile).not.toHaveBeenCalled()
})

it('should create a new package.json using the template file if the consumer package.json does not exist', async () => {
  ;(readFile as jest.Mock).mockImplementation((path: string) => {
    if (path === consumerPackageFilePath) {
      return Promise.reject(new Error('File not found'))
    } else if (path === docsCorePackageFilePath) {
      return Promise.resolve('{}')
    }
  })

  await updatePackageFile('/astro', '/consumer')

  expect(copyFile).toHaveBeenCalledWith(
    templateFilePath,
    consumerPackageFilePath,
  )
  expect(console.log).toHaveBeenCalledWith(
    `${consumerPackageFilePath} has been created using the template file.`,
  )
})
