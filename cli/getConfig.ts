/* eslint-disable no-console */
export interface CollectionDefinition {
  base?: string
  packageName?: string
  version?: string
  pattern: string
  name: string
}

export interface PropsGlobs {
  include: string[]
  exclude: string[]
}

export interface DocsConfig {
  content: CollectionDefinition[];
  outputDir: string;
  propsGlobs: PropsGlobs[];
  repoRoot?: string;
}

export async function getConfig(fileLocation: string): Promise<DocsConfig | undefined> {
  try {
    const { config } = await import(fileLocation)
    return config as DocsConfig
  } catch (e: any) {
    if (['ERR_MODULE_NOT_FOUND', 'MODULE_NOT_FOUND'].includes(e.code)) {
      console.error(
        'pf-docs.config.mjs not found, have you created it at the root of your package?',
      )
      return
    }
    console.error(e)
    return
  }
}
