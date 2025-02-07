// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ["@patternfly/*", "react-dropzone"],
    },
    server: {
      fs: {
        allow: ['./']
      }
    }
  },

  adapter: node({
    mode: 'standalone'
  })
});