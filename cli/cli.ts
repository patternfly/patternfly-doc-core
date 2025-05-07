#!/usr/bin/env node
/* eslint-disable no-console */
import { Command } from 'commander'
import { build, dev, preview, sync } from 'astro'
import { join } from 'path'
import { createCollectionContent } from './createCollectionContent.js'
import { setFsRootDir } from './setFsRootDir.js'
import { createConfigFile } from './createConfigFile.js'
import { updatePackageFile } from './updatePackageFile.js'
import { getConfig } from './getConfig.js'
import { symLinkConfig } from './symLinkConfig.js'
import { buildPropsData } from './buildPropsData.js'
import { hasFile } from './hasFile.js'

function updateContent(program: Command) {
  const { verbose } = program.opts()

  if (verbose) {
    console.log('Verbose mode enabled')
  }

  createCollectionContent(
    astroRoot,
    `${process.cwd()}/pf-docs.config.mjs`,
    verbose,
  )
}

async function generateProps(program: Command, forceProps: boolean = false) {
  const { verbose, props } = program.opts()

  if (!props && !forceProps) {
    return
  }

  if (verbose) {
    console.log('Verbose mode enabled')
  }

  buildPropsData(
    currentDir,
    astroRoot,
    `${currentDir}/pf-docs.config.mjs`,
    verbose,
  )
}

let astroRoot = ''

try {
  astroRoot = import.meta
    .resolve('@patternfly/patternfly-doc-core')
    .replace('dist/cli/cli.js', '')
    .replace('file://', '')
} catch (e: any) {
  if (e.code === 'ERR_MODULE_NOT_FOUND') {
    astroRoot = process.cwd()
  } else {
    console.error('Error resolving astroRoot', e)
  }
}

const currentDir = process.cwd()

const program = new Command()
program.name('pf-doc-core')

program.option('--verbose', 'verbose mode', false)
program.option('--props', 'generate props data', false)

program.command('setup').action(async () => {
  await Promise.all([
    updatePackageFile(astroRoot, currentDir),
    createConfigFile(astroRoot, currentDir),
  ])

  console.log(
    '\nSetup complete, next install dependencies with your package manager of choice and then run the `init:docs` script',
  )
})

program.command('init').action(async () => {
  await setFsRootDir(astroRoot, currentDir)
  await symLinkConfig(astroRoot, currentDir)
  console.log(
    '\nInitialization complete, next update your pf-docs.config.mjs file and then run the `start` script to start the dev server',
  )
})

program.command('start').action(async () => {
  updateContent(program)
  
  // if a props file hasn't been generated yet, but the consumer has propsData, it will cause a runtime error so to
  // prevent that we're just creating a props file regardless of what they say if one doesn't exist yet
  const hasPropsFile = await hasFile(join(astroRoot, 'dist', 'props.json'))
  await generateProps(program, !hasPropsFile)
  dev({ mode: 'development', root: astroRoot })
})

program.command('build').action(async () => {
  updateContent(program)
  await generateProps(program, true)
  const config = await getConfig(`${currentDir}/pf-docs.config.mjs`)
  if (!config) {
    console.error(
      'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
    )
    return
  }

  if (!config.outputDir) {
    console.error(
      "No outputDir found in config file, an output directory must be defined in your config file e.g. 'dist'",
    )
    return
  }

  build({ root: astroRoot, outDir: join(currentDir, config.outputDir) })
})

program.command('generate-props').action(async () => {
  await generateProps(program, true)
  console.log('\nProps data generated')
})

program.command('serve').action(async () => {
  updateContent(program)
  preview({ root: astroRoot })
})

program.command('sync').action(async () => {
  sync({ root: astroRoot })
})

program.parse(process.argv)
