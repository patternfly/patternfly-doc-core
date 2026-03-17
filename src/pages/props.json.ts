import type { APIRoute } from 'astro'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { getOutputDir } from '../utils/getOutputDir'

// Prerender at build time so this doesn't run in the Cloudflare Worker
export const prerender = true

export const GET: APIRoute = async () => {
  try {
    const outputDir = await getOutputDir()
    const propsFilePath = join(outputDir, 'props.json')
    const propsData = await readFile(propsFilePath, 'utf-8')

    return new Response(propsData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to prerender /props.json: ${details}`)
  }
}
