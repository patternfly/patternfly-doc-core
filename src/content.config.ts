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

  return defineCollection({
    loader: glob({ base: dir, pattern }),
    schema: z.object({
      id: z.string(),
      section: z.string(),
      title: z.string().optional(),
    }),
  })
}

export const collections = content.reduce(
  (acc, contentObj) => {
    acc[contentObj.name] = defineContent(contentObj)
    return acc
  },
  {} as Record<string, ReturnType<typeof defineContent>>,
)
