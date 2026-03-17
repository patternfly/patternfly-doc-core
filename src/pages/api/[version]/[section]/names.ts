import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { fetchProps } from '../../../../utils/propsData/fetch'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  try {
    const props = await fetchProps(url)

    const propsKey = new RegExp("Props", 'i'); // ignore ComponentProps objects
    const names = Object.keys(props).filter(name => !propsKey.test(name))

    return createJsonResponse(names)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Component names data not found', details },
      500,
    )
  }
}
