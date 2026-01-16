import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../../utils/apiHelpers'
import { getConfig } from '../../../../../../cli/getConfig'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { sentenceCase } from 'change-case'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { version, section, page } = params

  if (!version || !section || !page) {
    return createJsonResponse(
      { error: 'Version, section, and page parameters are required' },
      400,
    )
  }

  try {
    const config = await getConfig(`${process.cwd()}/pf-docs.config.mjs`)
    const outputDir = config?.outputDir || join(process.cwd(), 'dist')
  
    const propsFilePath = join(outputDir, 'props.json')
    const propsDataFile = readFileSync(propsFilePath)
    const props = JSON.parse(propsDataFile.toString())
  
    const propsData = props[sentenceCase(page)]
    return createJsonResponse(propsData)
  
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Props data not found', details },
      500,
    )
  }
}



