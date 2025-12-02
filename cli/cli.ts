#!/usr/bin/env node
/* eslint-disable no-console */
import { Command } from 'commander'
import { build, dev, preview, sync } from 'astro'
import { join, resolve } from 'path'
import { createCollectionContent } from './createCollectionContent.js'
import { setFsRootDir } from './setFsRootDir.js'
import { createConfigFile } from './createConfigFile.js'
import { updatePackageFile } from './updatePackageFile.js'
import { DocsConfig, getConfig } from './getConfig.js'
import { symLinkConfig } from './symLinkConfig.js'
import { buildPropsData } from './buildPropsData.js'
import { hasFile } from './hasFile.js'
import { convertToMDX } from './convertToMDX.js'
import { mkdir, copyFile } from 'fs/promises'
import { fileExists } from './fileExists.js'

const currentDir = process.cwd()
const config = await getConfig(`${currentDir}/pf-docs.config.mjs`)

if (!config) {
  console.error(
    'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
  )
  process.exit(1)
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

const absoluteOutputDir = resolve(currentDir, config.outputDir)

await mkdir(absoluteOutputDir, { recursive: true })

async function updateContent(program: Command) {
  const { verbose } = program.opts()
  if (!config) {
    console.error(
      'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
    )
    return config
  }
  if (verbose) {
    console.log('Verbose mode enabled')
  }

  await createCollectionContent(
    astroRoot,
    `${currentDir}/pf-docs.config.mjs`,
    verbose,
  )
}

async function generateProps(program: Command, forceProps: boolean = false) {
  const { verbose, props } = program.opts()
  const { repoRoot } = config
  const rootDir = repoRoot ? resolve(currentDir, repoRoot) : currentDir

  if (!props && !forceProps) {
    return
  }

  if (verbose) {
    console.log('Verbose mode enabled')
  }

  buildPropsData(rootDir, `${currentDir}/pf-docs.config.mjs`, verbose)
}

async function transformMDContentToMDX() {
  if (config.content) {
    await Promise.all(
      config.content.map((contentObj) => convertToMDX(contentObj.pattern)),
    )
  }
}

async function initializeApiIndex() {
  const templateIndexPath = join(astroRoot, 'cli', 'templates', 'apiIndex.json')
  const targetIndexPath = join(astroRoot, 'src', 'apiIndex.json')

  const indexExists = await fileExists(targetIndexPath)

  // early return if the file exists from a previous build
  if (indexExists) {
    console.log('apiIndex.json already exists, skipping initialization')
    return
  }

  try {
    await copyFile(templateIndexPath, targetIndexPath)
    console.log('Initialized apiIndex.json')
  } catch (e: any) {
    console.error('Error copying apiIndex.json template:', e)
  }
}

async function buildProject(): Promise<DocsConfig | undefined> {
  await updateContent(program)
  await generateProps(program, true)
  if (!config) {
    console.error(
      'No config found, please run the `setup` command or manually create a pf-docs.config.mjs file',
    )
    return config
  }

  if (!config.outputDir) {
    console.error(
      "No outputDir found in config file, an output directory must be defined in your config file e.g. 'dist'",
    )
    return config
  }

  await initializeApiIndex()
  await transformMDContentToMDX()

  build({
    root: astroRoot,
    outDir: join(absoluteOutputDir, 'docs'),
  })

  return config
}

async function deploy() {
  const { verbose } = program.opts()

  if (verbose) {
    console.log('Starting Cloudflare deployment...')
  }

  try {
    // First build the project
    const config = await buildProject()
    if (config) {
      if (verbose) {
        console.log('Build complete, deploying to Cloudflare...')
      }

      // Deploy using Wrangler
      const { execSync } = await import('child_process')
      const outputPath = join(absoluteOutputDir, 'docs')

      execSync(`npx wrangler pages deploy ${outputPath}`, {
        stdio: 'inherit',
        cwd: currentDir,
      })

      console.log('Successfully deployed to Cloudflare Pages!')
    }
  } catch (error) {
    console.error('Deployment failed:', error)
    process.exit(1)
  }
}

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
  await updateContent(program)
  await initializeApiIndex()

  // if a props file hasn't been generated yet, but the consumer has propsData, it will cause a runtime error so to
  // prevent that we're just creating a props file regardless of what they say if one doesn't exist yet
  const hasPropsFile = await hasFile(join(absoluteOutputDir, 'props.json'))
  await generateProps(program, !hasPropsFile)
  dev({ mode: 'development', root: astroRoot })
})

program.command('build').action(async () => {
  await buildProject()
})

program.command('generate-props').action(async () => {
  await generateProps(program, true)
  console.log('\nProps data generated')
})

program.command('serve').action(async () => {
  await updateContent(program)
  preview({ root: astroRoot })
})

program.command('sync').action(async () => {
  sync({ root: astroRoot })
})

program
  .command('convert-to-mdx')
  .argument('<globPath>', 'The glob path to the files to convert')
  .action(async (globPath: string) => {
    await convertToMDX(globPath)
  })

program.command('deploy').action(async () => {
  await deploy()
})

program.parse(process.argv)
