import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/writing" }),
  schema: z.object({
    title: z.string(),
    deck: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().default(false)
  })
});

const initiatives = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/initiatives" }),
  schema: z.object({
    title: z.string(),
    meta: z.string(),
    scope: z.string(),
    bullets: z.array(z.string()).max(3),
    order: z.number().int().nonnegative()
  })
});

export const collections = {
  writing,
  initiatives
};
