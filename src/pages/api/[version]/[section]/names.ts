import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../../../utils/apiHelpers'
import { getConfig } from '../../../../../cli/getConfig'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { version, section } = params

  if (!version || !section) {
    return createJsonResponse(
      { error: 'Version and section parameters are required' },
      400,
    )
  }

  try {
    const config = await getConfig(`${process.cwd()}/pf-docs.config.mjs`)
    const outputDir = config?.outputDir || join(process.cwd(), 'dist')
  
    const propsFilePath = join(outputDir, 'props.json')
    const propsDataFile = readFileSync(propsFilePath)
    const props = JSON.parse(propsDataFile.toString())
  
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



