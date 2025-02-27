/* eslint-disable no-console */
import { readFile, writeFile } from 'fs/promises'

export async function setFsRootDir(
  astroRootDir: string,
  consumerRootDir: string,
) {
  const astroConfigFile = astroRootDir + 'astro.config.mjs'
  const astroConfigFileContent = await readFile(astroConfigFile, 'utf8')

  const defaultAllowList = "allow: ['./']"

  if (!astroConfigFileContent.includes(defaultAllowList)) {
    return
  }

  const newAstroConfigFileContent = astroConfigFileContent.replace(
    defaultAllowList,
    `allow: ['${consumerRootDir}/']`,
  )

  try {
    await writeFile(astroConfigFile, newAstroConfigFileContent)
  } catch (e: any) {
    console.error(`Error setting the server allow list in ${astroRootDir}`, e)
  } finally {
    console.log('fs value set created')
  }
}
