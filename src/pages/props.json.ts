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
    return new Response(
      JSON.stringify({ error: 'Failed to load props data', details: error }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}
