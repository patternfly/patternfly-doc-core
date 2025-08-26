import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { getConfig } from '../../cli/getConfig'

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const config = await getConfig(`${process.cwd()}/pf-docs.config.mjs`)
  const outputDir = config?.outputDir || join(process.cwd(), 'dist')

  const propsFilePath = join(outputDir, 'props.json')
  const propsDataFile = readFileSync(propsFilePath)
  const props = JSON.parse(propsDataFile.toString())

  const queryParams = new URL(request.url).searchParams
  const components = queryParams.get('components')
  const componentsArray = components?.split(',')
  const propsData = componentsArray?.map((component) => props[component])

  return new Response(JSON.stringify(propsData))
}
