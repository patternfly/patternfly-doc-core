/**
 * @jest-environment node
 */
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const outputDir = join(__dirname, 'output')
const run1Docs = join(outputDir, 'run1', 'apiIndex.docs.json')
const run2Docs = join(outputDir, 'run2', 'apiIndex.docs.json')
const run1Root = join(outputDir, 'run1', 'apiIndex.dist-root.json')
const run2Root = join(outputDir, 'run2', 'apiIndex.dist-root.json')

function canonicalizeJson(value: any): any {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJson)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeJson(value[key])])
    )
  }
  return value
}

function getCanonicalSha1(filePath: string): string {
  const raw = readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  const canonical = JSON.stringify(canonicalizeJson(parsed))

  return crypto.createHash('sha1').update(canonical).digest('hex')
}

describe('PatternFly Org apiIndex integration', () => {
  beforeAll(() => {
    for (const filePath of [run1Docs, run2Docs, run1Root, run2Root]) {
      if (!existsSync(filePath)) {
        throw new Error(
          `Missing ${filePath}. Run tests/container/run.sh first.`,
        )
      }
    }
  })

  it('matches canonical SHA-1 snapshot', () => {
    expect(getCanonicalSha1(run1Docs)).toMatchSnapshot('canonical-docs-sha1')
  })

  it('emits examples and identical docs indexes in consecutive builds', () => {
    const firstDocs = readFileSync(run1Docs, 'utf8')
    const firstIndex = JSON.parse(firstDocs) as {
      examples: Record<string, unknown>
    }

    expect(Object.keys(firstIndex.examples)).not.toHaveLength(0)
    expect(readFileSync(run2Docs, 'utf8')).toBe(firstDocs)
  })

  it("copies Astro's completed index to the root output", () => {
    expect(readFileSync(run1Root, 'utf8')).toBe(readFileSync(run1Docs, 'utf8'))
    expect(readFileSync(run2Root, 'utf8')).toBe(readFileSync(run2Docs, 'utf8'))
  })
})
