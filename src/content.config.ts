import { defineCollection, z } from "astro:content";
import { glob } from 'astro/loaders';

const testCollection = defineCollection({
  loader: glob({ pattern: "*.md", base: "test"}),
  schema: z.object({ title: z.string() }),
});

export const collections = {
  test: testCollection,
};
