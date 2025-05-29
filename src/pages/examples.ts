import { readFileSync } from 'fs'
import { glob } from 'glob'
import { join } from 'path'

import { getConfig } from '../../cli/getConfig'

// const propsFilePath = join(process.cwd(), 'dist', 'props.json')
// const propsData = readFileSync(propsFilePath)
// const props = JSON.parse(propsData.toString())
const rootDir = process.cwd()

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const config = await getConfig(join(rootDir, 'pf-docs.config.mjs'))

  if (!config) {
    return new Response(JSON.stringify({ foo: 'bar' }))
  }

  const { content } = config

  const externalContent = content.filter((collection) => collection.packageName)
  const internalContent = content.filter((collection) => collection.base)

  const externalGlobs = await Promise.all(
    externalContent.map((collection) =>
      glob(
        join(
          'node_modules',
          collection.packageName as string,
          `/${collection.pattern.replace('md', 'tsx')}`,
        ),
      ),
    ),
  )

  const internalGlobs = await Promise.all(
    internalContent.map((collection) =>
      glob(
        join(
          collection.base as string,
          `/${collection.pattern.replace('md', 'tsx')}`,
        ),
      ),
    ),
  )

  const allGlobs = [...externalGlobs, ...internalGlobs].flat()

  const queryParams = new URL(request.url).searchParams
  const examples = queryParams.get('exampleNames')
  const examplesArray = examples?.split(',')
  const examplesSrc = examplesArray?.map((example) => ({
    name: example,
    path: allGlobs.find((file) => file.includes(example)),
  }))

  const res = examplesSrc?.reduce((acc, example) => {
    if (example.path) {
      acc[example.name] = readFileSync(example.path, 'utf-8')
    }

    return acc
  }, {} as any)

  return new Response(JSON.stringify(res))
}
