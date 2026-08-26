// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

import cloudflare from '@astrojs/cloudflare';

/**
 * The documentation site UI pages (index + docs pages) live in `src/site-pages`
 * rather than `src/pages` so they are NOT part of Astro's default file-based
 * routing. This keeps them out of the build unless explicitly requested.
 *
 * The API routes and their supporting static endpoints stay in `src/pages` and
 * are always built.
 *
 * Site pages are injected into routing when:
 *   - running the dev server (`command === 'dev'`), so local development always
 *     has the full experience, or
 *   - building with the `BUILD_SITE=true` environment variable set (the CLI
 *     `build --site` flag sets this).
 *
 * See architecture.md for the full rationale.
 */
const optionalSitePages = {
  name: 'optional-site-pages',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      const includeSite = command === 'dev' || process.env.BUILD_SITE === 'true';
      if (!includeSite) {
        return;
      }

      const entry = (relativePath) =>
        fileURLToPath(new URL(relativePath, import.meta.url));

      injectRoute({
        pattern: '/',
        entrypoint: entry('./src/site-pages/index.astro'),
      });
      injectRoute({
        pattern: '/[section]/[...page]',
        entrypoint: entry('./src/site-pages/[section]/[...page].astro'),
      });
      injectRoute({
        pattern: '/[section]/[page]/[tab]',
        entrypoint: entry('./src/site-pages/[section]/[page]/[tab].astro'),
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), optionalSitePages],
  vite: {
    ssr: {
      noExternal: ["@patternfly/*", "react-dropzone"],
      external: ["fs", "node:fs", "node:path", "path", "fs/promises"]
    },
    server: {
      fs: {
        allow: ['./']
      }
    },
  },
  adapter: cloudflare({
    imageService: 'compile'
  })
});