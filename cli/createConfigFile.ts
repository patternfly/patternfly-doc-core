/* eslint-disable no-console */
import { copyFile, access } from 'fs/promises'
import { join } from 'path'

export async function createConfigFile(
  astroRootDir: string,
  consumerRootDir: string,
) {
  const configFileName = 'pf-docs.config.mjs'
  const configFilePath = join(consumerRootDir, configFileName)
  const templateFilePath = join(
    astroRootDir,
    'cli',
    'templates',
    configFileName,
  )

  const fileExists = await access(configFilePath)
    .then(() => true)
    .catch(() => false)

  if (fileExists) {
    console.log(
      `${configFileName} already exists, proceeding to next setup step`,
    )
  } else {
    await copyFile(templateFilePath, configFilePath)
      .then(() =>
        console.log(`${configFileName} has been created in ${consumerRootDir}`),
      )
      .catch((error) => {
        console.error(`Error creating ${configFileName} in ${consumerRootDir}.`)
        console.error(error)
      })
  }
}
