import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

import {
  precomputeExamplesByPath,
  writePrecomputedExamplesCache,
} from '../precomputeExamplesByPath.js'
import type { DocsConfig } from '../getConfig.js'

describe('precomputeExamplesByPath', () => {
  let tempRoot = ''
  let configDir = ''

  beforeEach(async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'pf-precompute-'))
    configDir = join(tempRoot, 'site')
    await mkdir(join(configDir, 'src', 'content', 'components', 'alert'), {
      recursive: true,
    })
  })

  afterEach(async () => {
    await rm(tempRoot, { recursive: true, force: true })
  })

  it('reads the generated MDX for a normal Markdown content glob', async () => {
    await writeFile(
      join(configDir, 'src/content/components/alert/Alert.md'),
      '---\nsection: components\nid: Alert\n---\n',
    )
    const mdxPath = join(configDir, 'src/content/components/alert/Alert.mdx')
    await writeFile(
      mdxPath,
      `---
section: components
id: Alert
---
### Default
<LiveExample src={AlertBasic} />
`,
    )

    const config: DocsConfig = {
      outputDir: 'dist',
      propsGlobs: [],
      content: [
        {
          name: 'content',
          base: 'src/content',
          pattern: '**/*.md',
          version: 'v6',
        },
      ],
    }

    const byPath = await precomputeExamplesByPath(config, configDir, configDir)

    expect(byPath['src/content/components/alert/Alert.mdx']).toEqual([
      { exampleName: 'AlertBasic', title: 'Default' },
    ])
  })

  it('uses generated MDX for a brace glob', async () => {
    const base = join(configDir, 'src/content/components/button')
    await mkdir(base, { recursive: true })
    await writeFile(
      join(base, 'Button.md'),
      `---
section: components
id: Button
---
### Should ignore
<LiveExample src={Ignored} />
`,
    )
    await writeFile(
      join(base, 'Button.mdx'),
      `---
section: components
id: Button
---
### From MDX
<LiveExample src={ButtonBasic} />
`,
    )

    const config: DocsConfig = {
      outputDir: 'dist',
      propsGlobs: [],
      content: [
        {
          name: 'content',
          base: 'src/content',
          pattern: '**/*.{md,mdx}',
          version: 'v6',
        },
      ],
    }

    const byPath = await precomputeExamplesByPath(config, configDir, configDir)
    const examples = byPath['src/content/components/button/Button.mdx'] ?? []
    expect(examples.map((item) => item.exampleName)).toEqual(['ButtonBasic'])
  })

  it('writes precomputed cache', async () => {
    const outDir = join(tempRoot, 'dist')
    const sample = {
      'src/content/components/alert/Alert.mdx': [
        { exampleName: 'AlertBasic', title: 'Default' },
      ],
    }
    await writePrecomputedExamplesCache(outDir, sample)
    const raw = await readFile(
      join(outDir, '.precomputed-examples.json'),
      'utf8',
    )
    expect(JSON.parse(raw)).toEqual(sample)
  })
})
