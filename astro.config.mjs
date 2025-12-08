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
      external: ["node:fs", "node:path"]
    },
    build: {
      rollupOptions: {
        external: [/apiIndex\.json$/]
      }
    },
    server: {
      fs: {
        allow: ['./']
      }
    }
  },
  adapter: cloudflare()
});