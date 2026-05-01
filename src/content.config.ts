import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

import { content } from './content'
import type { CollectionDefinition } from '../cli/getConfig'
import { convertToMDX } from '../cli/convertToMDX'

function defineContent(contentObj: CollectionDefinition) {
  const { base, packageName, pattern, name, frontmatterDefaults, frontmatterMapping } = contentObj

  if (!base && !packageName) {
    // eslint-disable-next-line no-console
    console.error('Either a base or packageName must be defined for ', name)
    return
  }

  // TODO: Expand for other packages that remain under the react umbrella (Table, CodeEditor, etc)
  const tabMap: Record<string, string> = {
    'react-component-docs': 'react',
    'core-component-docs': 'html',
  }

  convertToMDX(`${base}/${pattern}`)
  const mdxPattern = pattern.replace(/\.md$/, '.mdx')

  const hasExternalFrontmatter = !!(frontmatterDefaults || frontmatterMapping)

  const baseSchema = z.object({
    id: hasExternalFrontmatter ? z.string().optional() : z.string(),
    section: hasExternalFrontmatter ? z.string().optional() : z.string(),
    subsection: z.string().optional(),
    title: z.string().optional(),
    // Generic frontmatter fields from external sources
    category: z.string().optional(),
    subcategory: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    propComponents: z.array(z.string()).optional(),
    tab: z.string().optional().default(tabMap[name]), // for component tabs
    source: z.string().optional(),
    tabName: z.string().optional(),
    sortValue: z.number().optional(), // used for sorting nav entries,
    cssPrefix: z
      .union([
        z.string().transform((val: string) => [val]),
        z.array(z.string()),
        z.null().transform(() => undefined),
      ])
      .optional(),
  }).transform((data) => {
    const result: Record<string, unknown> = { ...data }

    // Apply frontmatter mapping (e.g. { title: "id" } maps the title value to id)
    if (frontmatterMapping) {
      for (const [sourceField, targetField] of Object.entries(frontmatterMapping)) {
        if (result[sourceField] != null && result[targetField] == null) {
          result[targetField] = result[sourceField]
        }
      }
    }

    // Apply frontmatter defaults (e.g. { section: "AI" } sets section if not already present)
    if (frontmatterDefaults) {
      for (const [field, value] of Object.entries(frontmatterDefaults)) {
        if (result[field] == null) {
          result[field] = value
        }
      }
    }

    return result
  })

  return defineCollection({
    loader: glob({ base, pattern: mdxPattern }),
    schema: baseSchema,
  })
}

export const collections = content.reduce(
  (acc, contentObj) => {
    const def = defineContent(contentObj)
    if (def) {
      acc[contentObj.name] = def
    }
    return acc
  },
  {} as Record<string, ReturnType<typeof defineContent>>,
)
