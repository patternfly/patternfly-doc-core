/* eslint-disable no-console */
import { copyFile, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export async function updatePackageFile(
  astroRootDir: string,
  consumerRootDir: string,
) {
  const packageFilePath = join(consumerRootDir, 'package.json')
  const templateFilePath = join(
    astroRootDir,
    'cli',
    'templates',
    'package.json',
  )
  const docsCorePackageFilePath = join(astroRootDir, 'package.json')
  const docsCorePackageFileContent = await readFile(
    docsCorePackageFilePath,
    'utf8',
  )
  const docsCorePackageJson = JSON.parse(docsCorePackageFileContent)
  const docsCorePackageName = docsCorePackageJson.name
  const docsCorePackageVersion = docsCorePackageJson.version

  const fileContent = await readFile(packageFilePath, 'utf8')
    .then((content) => content)
    .catch(() => false)

  if (typeof fileContent === 'string') {
    const packageJson = JSON.parse(fileContent)
    const templateContent = await readFile(templateFilePath, 'utf8')
    const templateJson = JSON.parse(templateContent)

    packageJson.scripts = {
      ...packageJson.scripts,
      ...templateJson.scripts,
    }

    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      [docsCorePackageName]: `^${docsCorePackageVersion}`,
    }

    await writeFile(packageFilePath, JSON.stringify(packageJson, null, 2))
    console.log(
      `${packageFilePath} has been updated with new scripts and devDependencies.`,
    )
  } else {
    console.log(
      `${packageFilePath} not found, creating a new one using the template file.`,
    )
    await copyFile(templateFilePath, packageFilePath)
    console.log(`${packageFilePath} has been created using the template file.`)
  }
}
