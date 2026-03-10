import { fetchProps } from '../utils/propsData/fetch'
import { createJsonResponse } from '../utils/apiHelpers'

export const prerender = false

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url)

  const components = url.searchParams.get('components')
  if (!components) {
    return createJsonResponse(
      { error: 'components query parameter is required' },
      400,
    )
  }

  try {
    const props = await fetchProps(url)
    const propsData = components
      .split(',')
      .map((component) => props[component.trim()])

    return createJsonResponse(propsData)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load props data', details },
      500,
    )
  }
}
