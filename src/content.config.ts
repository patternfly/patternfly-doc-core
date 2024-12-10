import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const textContent = defineCollection({
  loader: glob({ pattern: '*.md', base: 'textContent' }),
  schema: z.object({
    id: z.string(),
    section: z.string(),
    title: z.string().optional(),
  }),
})

export const collections = {
  textContent,
}
