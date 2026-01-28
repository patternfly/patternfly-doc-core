import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../../utils/apiHelpers'
import { getConfig } from '../../../../../../cli/getConfig'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { sentenceCase, removeSubsection } from '../../../../../utils/case'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { page } = params

  if (!page) {
    return createJsonResponse(
      { error: 'Page parameter is required' },
      400,
    )
  }

  try {
    const config = await getConfig(`${process.cwd()}/pf-docs.config.mjs`)
    const outputDir = config?.outputDir || join(process.cwd(), 'dist')

    const propsFilePath = join(outputDir, 'props.json')
    const propsDataFile = readFileSync(propsFilePath)
    const props = JSON.parse(propsDataFile.toString())

    const propsData = props[sentenceCase(removeSubsection(page))]

    if (propsData === undefined) {
      return createJsonResponse(
        { error: `Props data for ${page} not found` },
        404,
      )
    }

    return createJsonResponse(propsData)

  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Props data not found', details },
      500,
    )
  }
}



