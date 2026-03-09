import type { APIRoute } from 'astro'
import { getApiIndex } from '../../utils/apiIndex/get'
import { removeSubsection } from '../../utils/case'
import { getOutputDir } from '../../utils/getOutputDir'
import { join } from 'path'
import { readFile } from 'fs/promises'

export const prerender = true

interface ComponentEntry {
  section: string
  page: string
  tabs: string[]
  hasProps: boolean
  hasCss: boolean
  exampleCount: number
}

export interface ComponentIndex {
  version: string
  components: Record<string, ComponentEntry>
}

// "about-modal" → "AboutModal", "forms_checkbox" → "Checkbox"
function pageToPascalCase(page: string): string {
  return removeSubsection(page)
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

export const GET: APIRoute = async () => {
  try {
    const index = await getApiIndex()

    // props.json keys include both component names ("Alert") and their prop
    // interfaces ("AlertProps"). Filter out the interface entries to get the
    // set of component names that have prop documentation available.
    let componentNamesWithProps = new Set<string>()
    try {
      const outputDir = await getOutputDir()
      const propsFile = await readFile(join(outputDir, 'props.json'), 'utf-8')
      const propsData = JSON.parse(propsFile)
      const propsSuffixPattern = /Props/i
      componentNamesWithProps = new Set(
        Object.keys(propsData).filter((name) => !propsSuffixPattern.test(name)),
      )
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }

    if (index.versions.length === 0) {
      throw new Error('API index contains no versions')
    }

    // Latest version is last in sorted array (e.g., ["v5", "v6"] → "v6")
    const version = index.versions[index.versions.length - 1]
    const sections = index.sections[version] || []

    const components: Record<string, ComponentEntry> = {}

    for (const section of sections) {
      const pagesKey = `${version}::${section}`
      const pages = index.pages[pagesKey] || []

      for (const page of pages) {
        const tabsKey = `${version}::${section}::${page}`
        const tabs = index.tabs[tabsKey] || []

        let exampleCount = 0
        for (const tab of tabs) {
          const examplesKey = `${tabsKey}::${tab}`
          const examples = index.examples[examplesKey] || []
          exampleCount += examples.length
        }

        const hasCss = tabsKey in index.css && index.css[tabsKey].length > 0

        const pascalName = pageToPascalCase(page)
        const hasProps = componentNamesWithProps.has(pascalName)

        // Prefer the first occurrence when multiple sections produce the same
        // PascalCase key (e.g., components/table vs extensions/data-view_table)
        if (!components[pascalName]) {
          components[pascalName] = {
            section,
            page,
            tabs,
            hasProps,
            hasCss,
            exampleCount,
          }
        }
      }
    }

    const componentIndex: ComponentIndex = { version, components }

    return new Response(JSON.stringify(componentIndex), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to generate component index',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
