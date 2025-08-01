/* eslint-disable no-console */

import { glob } from 'glob'
import { writeFile } from 'fs/promises'
import { join } from 'path'

import { tsDocgen } from './tsDocGen.js'
import { getConfig, PropsGlobs } from './getConfig.js'

interface Prop {
  name: string
  type: string
  description?: string
  required?: boolean
  defaultValue?: string
  hide?: boolean
}
interface TsDoc {
  name: string
  description: string
  props: Prop[]
}
interface PropsData {
  [key: string]: TsDoc
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
      const files = await glob(include, { cwd: root, ignore: exclude })
      return files
    }),
  )
  return files.flat()
}

async function getPropsData(files: string[], verbose: boolean) {
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

export async function buildPropsData(
  rootDir: string,
  configFile: string,
  verbose: boolean,
) {
  const config = await getConfig(configFile)
  if (!config) {
    return
  }

  const { propsGlobs, outputDir } = config
  if (!propsGlobs) {
    console.error('No props data found in config')
    return
  }

  const files = await getFiles(rootDir, propsGlobs)
  if (verbose) {
    console.log(`Found ${files.length} files to parse`)
  }

  const propsData = await getPropsData(files, verbose)

  const propsFile = join(outputDir, 'props.json')

  if (verbose) {
    const absolutePropsFilePath = join(process.cwd(), propsFile)
    console.log(`Writing props data to ${absolutePropsFilePath}`)
  }

  await writeFile(propsFile, JSON.stringify(propsData))
}
