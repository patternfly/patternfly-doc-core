import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

import { content } from './content'
import type { CollectionDefinition } from '../cli/getConfig'

function defineContent(contentObj: CollectionDefinition) {
  const { base, packageName, pattern, name } = contentObj
  const dir = `${process.cwd()}/${base || `node_modules/${packageName}`}`

  if (!base && !packageName) {
    // eslint-disable-next-line no-console
    console.error('Either a base or packageName must be defined for ', name)
    return
  }

  // Todo: expand to cover deprecated & demos tabs (look in filepath, or enforce tab in frontmatter for nonstandard tabs)
  const tabMap: any = {
    'react-component-docs': 'react',
    'core-component-docs': 'html' 
  };

  return defineCollection({
    loader: glob({ base: dir, pattern }),
    schema: z.object({
      id: z.string(),
      section: z.string(),
      subsection: z.string().optional(),
      title: z.string().optional(),
      tab: z.string().optional().default(tabMap[name])
      // package: z.string().optional().default(packageName as string)
    }),
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
