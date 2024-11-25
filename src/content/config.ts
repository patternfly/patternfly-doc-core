import { defineCollection, z } from "astro:content";

const testCollection = defineCollection({
  type: "content",
  schema: z.object({ title: z.string() }),
});

export const collections = {
  test: testCollection,
};
