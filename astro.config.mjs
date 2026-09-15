// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

import cloudflare from '@astrojs/cloudflare';

/**
 * The documentation site UI pages live in `src/site-pages` rather than
 * `src/pages`, so they are NOT part of Astro's default file-based routing and
 * are never bundled unless explicitly requested. This makes the API-only build
 * (the default) cheap: the memory-heavy site pages are excluded entirely.
 *
 * The API routes and their supporting static endpoints stay in `src/pages` and
 * are always built.
 *
 * Routing at `/`:
 *   - Full site build (dev, or `BUILD_SITE=true`): the real home + docs pages
 *     are injected.
 *   - API-only build (the default): a lightweight `api-landing.astro` stub is
 *     injected at `/` instead, so `/` still resolves without pulling in any
 *     heavy modules.
 *
 * See architecture.md for the full rationale.
 */
const optionalSitePages = {
  name: 'optional-site-pages',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      const entry = (relativePath) =>
        fileURLToPath(new URL(relativePath, import.meta.url));

      // Always build the full site in dev; in build, only when BUILD_SITE=true.
      const buildFullSite = command === 'dev' || process.env.BUILD_SITE === 'true';

      if (buildFullSite) {
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
      } else {
        injectRoute({
          pattern: '/',
          entrypoint: entry('./src/site-pages/api-landing.astro'),
        });
      }
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