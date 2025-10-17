/* eslint-disable no-console */
import { writeFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import { getConfig } from './getConfig.js'
import { existsSync, readFileSync } from 'fs'

/**
 * Looks for the specified package in the node_modules directory in the configDir, then recursively
 * looks for the package in the parent directories until it is found, stopping if it is not found
 * and the repoRootDir is reached.
 */
const findPackage = (
  dir: string,
  packageName: string,
  repoRootDir: string,
  verbose?: boolean,
) => {
  const nodeModulesPath = join(dir, 'node_modules')

  if (verbose) {
    console.log('looking for package in ', nodeModulesPath, '\n')
  }

  const packagePath = join(nodeModulesPath, packageName)
  const packageJsonPath = join(packagePath, 'package.json')

  if (existsSync(packageJsonPath)) {
    if (verbose) {
      console.log('found package at ', packagePath, '\n')
    }

    return packagePath
  }
  if (dir === repoRootDir) {
    if (verbose) {
      console.log('reached repoRootDir, stopping search')
    }
    return null
  }

  const parentDir = dirname(dir)
  return findPackage(parentDir, packageName, repoRootDir, verbose)
}

/**
 * Extracts the major version from a package.json file
 */
const getPackageVersion = (packagePath: string | null, verbose?: boolean) => {
  if (!packagePath) {
    return null
  }

  const packageJsonPath = join(packagePath, 'package.json')

  if (!existsSync(packageJsonPath)) {
    return null
  }

  try {
    const packageJsonContent = readFileSync(packageJsonPath, 'utf-8')
    const packageJson = JSON.parse(packageJsonContent)
    const version = packageJson.version

    if (version) {
      // Extract major version (e.g., "6.2.2" -> "v6")
      const majorVersion = `v${version.split('.')[0]}`
      if (verbose) {
        console.log(
          `Extracted version ${majorVersion} from ${packageJsonPath}\n`,
        )
      }
      return majorVersion
    }
  } catch (error) {
    if (verbose) {
      console.error(`Error reading package.json at ${packageJsonPath}:`, error)
    }
  }

  return null
}

export async function createCollectionContent(
  astroRoot: string,
  configFileLocation: string,
  verbose: boolean,
) {
  const verboseModeLog = (...messages: any) => {
    if (verbose) {
      console.log(...messages)
    }
  }

  const config = await getConfig(configFileLocation)
  if (!config) {
    console.error(
      'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
    )
    return
  }

  const { content, repoRoot } = config
  if (!content) {
    console.error('No content found in config')
    return
  }

  verboseModeLog('configuration content entry: ', content, '\n')

  const contentFile = join(astroRoot, 'src', 'content.ts')

  verboseModeLog('Creating content file', contentFile, '\n')

  const configDir = dirname(configFileLocation)

  const repoRootDir = repoRoot ? resolve(configDir, repoRoot) : configDir

  verboseModeLog('repoRootDir: ', repoRootDir, '\n')

  const contentWithAbsolutePaths = content.map((contentEntry) => {
    if (contentEntry.base) {
      const absoluteBase = resolve(configDir, contentEntry.base)

      verboseModeLog('relative path: ', contentEntry.base)
      verboseModeLog('absolute path: ', absoluteBase, '\n')

      const version = getPackageVersion(absoluteBase, verbose)

      return {
        ...contentEntry,
        base: absoluteBase,
        version,
      }
    }

    const { packageName } = contentEntry

    if (!packageName) {
      verboseModeLog(
        'no package name or base path found, skipping entry ',
        contentEntry.name,
        '\n',
      )
      return {
        ...contentEntry,
        base: null,
        version: null,
      }
    }

    const packagePath = findPackage(
      configDir,
      packageName,
      repoRootDir,
      verbose,
    )

    const version = getPackageVersion(packagePath, verbose)

    return {
      base: packagePath,
      version,
      ...contentEntry,
    }
  })

  try {
    await writeFile(
      contentFile,
      `export const content = ${JSON.stringify(contentWithAbsolutePaths)}`,
    )
  } catch (e: any) {
    console.error('Error writing content file', e)
  } finally {
    verboseModeLog('Content file created')
  }
}
