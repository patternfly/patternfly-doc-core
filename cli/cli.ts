#!/usr/bin/env node
import { Command } from 'commander'
import { build, dev, preview, sync } from 'astro'
import { createCollectionContent } from './createCollectionContent.js'
import { setFsRootDir } from './setFsRootDir.js'

const astroRoot = import.meta
  .resolve('patternfly-doc-core')
  .replace('dist/cli/cli.js', '')
  .replace('file://', '')

const program = new Command()
program.name('pf-doc-core')

program.option('--verbose', 'verbose mode', false)

program.command('init').action(async () => {
  await setFsRootDir(astroRoot, process.cwd())
})

program.command('start').action(async () => {
  dev({ mode: 'development', root: astroRoot })
})

program.command('build').action(async () => {
  build({ root: astroRoot })
})

program.command('serve').action(async () => {
  preview({ root: astroRoot })
})

program.command('sync').action(async () => {
  sync({ root: astroRoot })
})

program.parse(process.argv)

const { verbose } = program.opts()

if (verbose) {
  // eslint-disable-next-line no-console
  console.log('Verbose mode enabled')
}

createCollectionContent(
  astroRoot,
  `${process.cwd()}/pf-docs.config.js`,
  verbose,
)
