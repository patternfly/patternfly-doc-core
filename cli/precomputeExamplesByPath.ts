import { mkdir, readFile, writeFile } from 'fs/promises'
import { join, relative, resolve } from 'path'
import { glob } from 'glob'
import type { DocsConfig } from './getConfig.js'
import { resolveContentEntryGlob } from './createCollectionContent.js'

const LIVE_EXAMPLE_REGEX = /<LiveExample[^>]*\ssrc=\{\s*(\w+)\s*\}[^>]*\/?>/g

export type ExampleEntry = { exampleName: string; title: string | null }

export type PrecomputedExamplesByPath = Record<string, ExampleEntry[]>

function extractExamplesWithTitles(body: string): ExampleEntry[] {
  const examples: ExampleEntry[] = []
  const seen = new Set<string>()
  let match

  while ((match = LIVE_EXAMPLE_REGEX.exec(body)) !== null) {
    const exampleName = match[1]
    if (exampleName && !seen.has(exampleName)) {
      seen.add(exampleName)
      const textBeforeExample = body.substring(0, match.index)
      const h3Matches = [...textBeforeExample.matchAll(/^### (.+)$/gm)]
      const title =
        h3Matches.length > 0 ? h3Matches[h3Matches.length - 1][1].trim() : null
      examples.push({ exampleName, title })
    }
  }

  return examples
}

export async function precomputeExamplesByPath(
  config: DocsConfig,
  configDir: string,
  astroRoot: string,
): Promise<PrecomputedExamplesByPath> {
  const repoRootDir = config.repoRoot
    ? resolve(configDir, config.repoRoot)
    : configDir
  const byPath: PrecomputedExamplesByPath = {}

  for (const contentObj of config.content ?? []) {
    const globPath = resolveContentEntryGlob(
      contentObj,
      configDir,
      repoRootDir,
      false,
    )
    if (!globPath) {
      continue
    }

    const mdxGlobPath = globPath.replace(/\.(?:md|\{md,mdx\})$/, '.mdx')
    const files = (await glob(mdxGlobPath))
      .filter((filePath) => filePath.endsWith('.mdx'))
      .sort()

    for (const filePath of files) {
      const examples = extractExamplesWithTitles(
        await readFile(filePath, 'utf8'),
      )
      if (examples.length > 0) {
        byPath[relative(astroRoot, resolve(filePath)).replace(/\\/g, '/')] =
          examples
      }
    }
  }

  return byPath
}

export async function writePrecomputedExamplesCache(
  outputDir: string,
  byPath: PrecomputedExamplesByPath,
): Promise<string> {
  const cachePath = join(outputDir, '.precomputed-examples.json')
  await mkdir(outputDir, { recursive: true })
  await writeFile(cachePath, `${JSON.stringify(byPath, null, 2)}\n`)
  return cachePath
}
