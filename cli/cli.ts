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

const astroRoot = import.meta
  .resolve('patternfly-doc-core')
  .replace('dist/cli/cli.js', '')
  .replace('file://', '')
const currentDir = process.cwd()

const program = new Command()
program.name('pf-doc-core')

program.option('--verbose', 'verbose mode', false)

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
  console.log(
    '\nInitialization complete, next update your pf-docs.config.mjs file and then run the `start` script to start the dev server',
  )
})

program.command('start').action(async () => {
  updateContent(program)
  dev({ mode: 'development', root: astroRoot })
})

program.command('build').action(async () => {
  updateContent(program)
  const config = await getConfig(`${currentDir}/pf-docs.config.mjs`)
  if (!config) {
    console.error(
      'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
    )
    return
  }

  if (!config.outputDir) {
    console.error("No outputDir found in config file, an output directory must be defined in your config file e.g. 'dist'")
    return
  }
    
  build({ root: astroRoot, outDir: join(currentDir, config.outputDir) })
})

program.command('serve').action(async () => {
  updateContent(program)
  preview({ root: astroRoot })
})

program.command('sync').action(async () => {
  sync({ root: astroRoot })
})

program.parse(process.argv)
