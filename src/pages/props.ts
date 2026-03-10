import { fetchProps } from '../utils/propsData/fetch'

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url)
  const props = await fetchProps(url)

  const components = url.searchParams.get('components')
  const componentsArray = components?.split(',')
  const propsData = componentsArray?.map((component) => props[component])

  return new Response(JSON.stringify(propsData))
}
