/* eslint-disable no-console */
import { symlink } from 'fs/promises'

export async function symLinkConfig(
  astroRootDir: string,
  consumerRootDir: string,
) {
  const configFileName = '/pf-docs.config.mjs'
  const docsConfigFile = consumerRootDir + configFileName

  try {
    await symlink(docsConfigFile, astroRootDir + configFileName)
  } catch (e: any) {
    console.error(
      `Error creating symlink to ${docsConfigFile} in ${astroRootDir}`,
      e,
    )
  } finally {
    console.log(`Symlink to ${docsConfigFile} in ${astroRootDir} created`)
  }
}
