import { readFileSync } from 'fs'
import { join } from 'path'

const propsFilePath = join(process.cwd(), 'dist', 'props.json')
const propsData = readFileSync(propsFilePath)
const props = JSON.parse(propsData.toString())

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const queryParams = new URL(request.url).searchParams
  const components = queryParams.get('components')
  const componentsArray = components?.split(',')
  const propsData = componentsArray?.map((component) => props[component])

  return new Response(JSON.stringify(propsData))
}
