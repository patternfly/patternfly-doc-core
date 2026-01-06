/* eslint-disable no-console */
import { symlink, rm } from 'fs/promises'
import { join } from 'path'
import { fileExists } from './fileExists.js'

export async function symLinkConfig(
  astroRootDir: string,
  consumerRootDir: string,
) {
  const configFileName = '/pf-docs.config.mjs'
  const defaultConfigFile = join(astroRootDir, 'src', configFileName)
  const consumerConfigFile = consumerRootDir + configFileName

  if (fileExists(defaultConfigFile)) {
    await rm(defaultConfigFile)
  }

  try {
    await symlink(consumerConfigFile, defaultConfigFile)
  } catch (e: any) {
    console.error(
      `Error creating symlink to ${consumerConfigFile} in ${astroRootDir}`,
      e,
    )
  } finally {
    console.log(`Symlink to ${consumerConfigFile} in ${astroRootDir} created`)
  }
}
