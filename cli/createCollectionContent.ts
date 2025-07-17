/* eslint-disable no-console */
import { writeFile } from 'fs/promises'
import { getConfig } from './getConfig.js'

export async function createCollectionContent(rootDir: string, configFile: string, verbose: boolean) {
  const config = await getConfig(configFile)
  if (!config) {
    return
  }

  const { content } = config
  if (!content) {
    console.error('No content found in config')
    return
  }

  const contentFile = rootDir + '/src/content.ts'

  try {
    await writeFile(
      contentFile,
      `export const content = ${JSON.stringify(content)}`,
    )
  } catch (e: any) {
    console.error('Error writing content file', e)
  } finally {
    if (verbose) {
      console.log('Content file created')
    }
  }
}
