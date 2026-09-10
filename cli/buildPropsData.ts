/* eslint-disable no-console */

import { glob } from 'glob'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'

import { tsDocgen } from './tsDocGen.js'
import { getConfig, PropsGlobs } from './getConfig.js'

export interface Prop {
  name: string
  type: string
  description?: string
  required?: boolean
  defaultValue?: string
  hide?: boolean
}
export interface TsDoc {
  name: string
  description: string
  props: Prop[]
}
export interface PropsData {
  [key: string]: TsDoc
}

export interface PackagePropsData {
  formatVersion: 1
  package: string
  packageVersion: string
  components: PropsData
}

// Build unique names for components with a "variant" extension
type TsDocVariants = 'next' | 'deprecated' | undefined
function getTsDocName(name: string, variant: TsDocVariants) {
  return `${name}${variant ? `-${variant}` : ''}`
}

function getTsDocNameVariant(source: string) {
  if (source.includes('next')) {
    return 'next'
  }

  if (source.includes('deprecated')) {
    return 'deprecated'
  }
}

async function getFiles(root: string, globs: PropsGlobs[]) {
  const files = await Promise.all(
    globs.map(async ({ include, exclude }) => {
      const files = await glob(include, { cwd: root, ignore: exclude, absolute: true })
      return files
    }),
  )
  return files.flat()
}

async function getPropsData(files: string[], verbose: boolean): Promise<PropsData> {
  const perFilePropsData = await Promise.all(
    files.map(async (file) => {
      if (verbose) {
        console.log(`Parsing props from ${file}`)
      }

      const props = (await tsDocgen(file)) as TsDoc[]

      const tsDocs = props.reduce((acc, { name, description, props }) => {
        const key = getTsDocName(name, getTsDocNameVariant(file))
        return { ...acc, [key]: { name, description, props } }
      }, {} as PropsData)

      return tsDocs
    }),
  )

  const combinedPropsData = perFilePropsData.reduce((acc, props) => {
    Object.keys(props).forEach((key) => {
      const propsData = props[key]
      if (acc[key]) {
        acc[key].props = [...acc[key].props, ...propsData.props]
      } else {
        acc[key] = propsData
      }
    })
    return acc
  }, {})

  return combinedPropsData
}

interface BuildPropsOptions {
  rootDir: string
  configFile: string
  outputFile: string
  verbose: boolean
}

async function getConfiguredPropsData(
  rootDir: string,
  configFile: string,
  verbose: boolean,
) {
  const verboseModeLog = (...messages: any) => {
    if (verbose) {
      console.log(...messages)
    }
  }

  verboseModeLog('Beginning props data build')

  const config = await getConfig(configFile)
  if (!config) {
    console.error('No config found, please run the `setup` command or manually create a pf-docs.config.mjs file')
    return
  }

  const { propsGlobs } = config
  if (!propsGlobs) {
    console.error('No props data found in config')
    return
  }

  const files = await getFiles(rootDir, propsGlobs)
  verboseModeLog(`Found ${files.length} files to parse`)

  return {
    propsData: await getPropsData(files, verbose),
    outputDir: config.outputDir,
    verboseModeLog,
  }
}

export async function buildPropsData(
  rootDir: string,
  configFile: string,
  verbose: boolean,
) {
  const configuredData = await getConfiguredPropsData(rootDir, configFile, verbose)
  if (!configuredData) {
    return
  }

  const { propsData, outputDir, verboseModeLog } = configuredData
  const propsFile = join(outputDir, 'props.json')
  const absolutePropsFilePath = join(process.cwd(), propsFile)
  verboseModeLog(`Writing props data to ${absolutePropsFilePath}`)

  await writeFile(propsFile, JSON.stringify(propsData))
}

export async function buildPackagePropsData({
  rootDir,
  configFile,
  outputFile,
  verbose,
}: BuildPropsOptions): Promise<PackagePropsData | undefined> {
  const configuredData = await getConfiguredPropsData(rootDir, configFile, verbose)
  if (!configuredData) {
    return
  }

  const packageJson = JSON.parse(
    await readFile(join(rootDir, 'package.json'), 'utf8'),
  ) as { name?: string; version?: string }

  if (!packageJson.name || !packageJson.version) {
    throw new Error('Package metadata must include name and version in package.json')
  }

  const packagePropsData: PackagePropsData = {
    formatVersion: 1,
    package: packageJson.name,
    packageVersion: packageJson.version,
    components: configuredData.propsData,
  }

  const outputPath = resolve(rootDir, outputFile)
  await mkdir(dirname(outputPath), { recursive: true })
  configuredData.verboseModeLog(`Writing package props data to ${outputPath}`)
  await writeFile(outputPath, `${JSON.stringify(packagePropsData, null, 2)}\n`)

  return packagePropsData
}
