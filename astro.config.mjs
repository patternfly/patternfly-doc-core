// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  vite: {
    ssr: {
      noExternal: ["@patternfly/*", "react-dropzone"],
      external: ["fs", "node:fs", "node:path", "path", "fs/promises"]
    },
    environments: {
      ssr: {
        resolve: {
          noExternal: ["@patternfly/*", "react-dropzone"],
        },
      },
      prerender: {
        resolve: {
          noExternal: ["@patternfly/*", "react-dropzone"],
        },
      },
    },
    server: {
      fs: {
        allow: ['./']
      }
    },
  },
  adapter: cloudflare({
    imageService: 'compile',
    prerenderEnvironment: 'node',
  })
});