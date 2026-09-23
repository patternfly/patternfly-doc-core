import type { APIRoute } from 'astro'
import { pascalCase } from 'change-case'

import { createJsonResponse } from '../../../../../utils/apiHelpers'
import { fetchProps } from '../../../../../utils/propsData/fetch'
import { removeSubsection } from '../../../../../utils/case'
import { fetchApiIndex } from '../../../../../utils/apiIndex/fetch'
import { getPrimaryPropComponent } from '../../../../../utils/apiIndex/props'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const { version, section, page } = params

  if (!page) {
    return createJsonResponse(
      { error: 'Page parameter is required' },
      400,
    )
  }

  try {
    const props = await fetchProps(url)
    const requestedComponent = url.searchParams.get('component')
    let propsData = props[pascalCase(removeSubsection(page))]

    // Page labels can differ from their primary React component name. A documented
    // member can be selected without exposing props outside its parent page.
    if (requestedComponent !== null || propsData === undefined) {
      const index = await fetchApiIndex(url)
      const propComponents = index.propComponents?.[`${version}::${section}::${page}`] || []
      const component = requestedComponent ?? getPrimaryPropComponent(page, propComponents)
      propsData = requestedComponent !== null && !propComponents.includes(component)
        ? undefined
        : props[component]
    }

    if (propsData === undefined) {
      return createJsonResponse(
        { error: `Props data for ${requestedComponent ?? page} not found` },
        404,
      )
    }

    return createJsonResponse(propsData)

  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load props data', details },
      500,
    )
  }
}
