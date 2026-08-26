# Architecture

This document describes how `@patternfly/patternfly-doc-core` is structured, how
its build works, and — importantly — how the **documentation API** and the
**documentation site UI** are decoupled so that they can be built independently.

## Overview

The project is a single [Astro](https://astro.build/) application driven by a
thin CLI (`cli/cli.ts`). It produces two distinct things from the same source:

1. **The documentation API** — a set of machine-readable JSON/text endpoints
   under `/api/**`, intended for LLM agents, MCP servers, and tooling.
2. **The documentation site UI** — the human-facing HTML pages (home page and
   the rendered component/pattern documentation).

The API is lightweight to build. The site UI is expensive to build because it
renders PatternFly React components and MDX content. To avoid paying that cost
when only the API is needed, **the API is built by default and the site UI is
opt-in**.

## Directory layout

```
cli/                     # Build CLI (compiled to dist/cli, exposed as the package bin)
  cli.ts                 # Command definitions: setup, init, start, build, deploy, ...
  getConfig.ts           # Reads pf-docs.config.mjs
  createCollectionContent.ts
  buildPropsData.ts
  ...

src/
  pages/                 # Astro file-based routing — ALWAYS built
    api/**               # The documentation API (SSR + a few static routes)
    apiIndex.json.ts     # Prerendered /apiIndex.json  (API depends on this)
    iconsIndex.json.ts   # Prerendered /iconsIndex.json (icons API depends on this)
    props.ts             # SSR /props endpoint (reads props.json)

  site-pages/            # Site UI pages — NOT in Astro routing by default;
    index.astro          # injected only in dev or when BUILD_SITE=true
    [section]/[...page].astro
    [section]/[page]/[tab].astro

  components/            # React + Astro components used by site-pages
  layouts/              # Astro layouts used by site-pages
  utils/                # Shared helpers (used by both API and site)
    apiIndex/           # API index generate/get/fetch
    apiRoutes/          # Content matching, example parsing, collections
    icons/              # Icon metadata + SVG helpers
  content.ts            # Generated list of content collections
  content.config.ts     # Astro content collection definitions

astro.config.mjs        # Astro config + the `optional-site-pages` integration
wrangler.jsonc          # Cloudflare Pages config (deploy target)
pf-docs.config.mjs      # Consumer-provided docs config (content sources, outputDir)
```

## The API / site split

### Why they can be separated

The API side is self-contained. Its route handlers only read from **source**
inputs, never from the built site output:

- SSR API routes (`prerender = false`) fetch the prerendered `/apiIndex.json` at
  runtime (`src/utils/apiIndex/fetch.ts`) — this keeps the Cloudflare Worker
  bundle small instead of embedding the ~500 KB index.
- Text/example routes read the original Markdown/MDX from the content source
  (e.g. `textContent/`) via `src/utils/apiRoutes/*`.
- Props routes read `props.json`; icon routes read `@patternfly/react-icons`
  static output and the prerendered `/iconsIndex.json`.

The heavy, memory-intensive work lives exclusively in the three site-UI pages,
which are the only files that import `@patternfly/react-core`, `LiveExample`,
`SectionGallery`, the layouts, and render MDX. Nothing in `src/pages/api/**`
depends on those pages being built.

### How the separation is implemented

Astro builds everything it finds under `src/pages/`. To take the site pages out
of the default build **without breaking their relative imports**, they were moved
to `src/site-pages/` — a sibling directory at the *same depth* as `src/pages/`.
Because both directories are direct children of `src/`, every relative import
inside the moved files (`../layouts/...`, `../../components/...`,
`../../content`, etc.) continues to resolve unchanged.

They are re-added to routing on demand by a small Astro integration in
`astro.config.mjs`:

```js
const optionalSitePages = {
  name: 'optional-site-pages',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      const includeSite = command === 'dev' || process.env.BUILD_SITE === 'true'
      if (!includeSite) return
      injectRoute({ pattern: '/',                      entrypoint: '.../src/site-pages/index.astro' })
      injectRoute({ pattern: '/[section]/[...page]',   entrypoint: '.../src/site-pages/[section]/[...page].astro' })
      injectRoute({ pattern: '/[section]/[page]/[tab]',entrypoint: '.../src/site-pages/[section]/[page]/[tab].astro' })
    },
  },
}
```

Entrypoints are resolved with `fileURLToPath(new URL('./src/site-pages/...', import.meta.url))`
so they resolve correctly whether the package runs from this repo or from a
consumer's `node_modules`.

Rules:

- **Dev server** (`command === 'dev'`): site pages are always injected, so local
  development has the full experience.
- **Build** (`command === 'build'`): site pages are injected only when the
  `BUILD_SITE=true` environment variable is set.

### Triggering a site build

The CLI `build` command exposes a `--site` flag. When passed, `cli/cli.ts` sets
`process.env.BUILD_SITE = 'true'` before invoking Astro's `build()`:

```ts
if (site) {
  process.env.BUILD_SITE = 'true'
}
```

npm scripts:

| Script            | Builds            | Command                                                   |
| ----------------- | ----------------- | -------------------------------------------------------- |
| `npm run build`   | API only          | `... cli.js build`                                        |
| `npm run build:all` | API + site UI   | `... cli.js build --site`                                 |

Both scripts run under `--max-old-space-size=8192`; SSR bundling of the API
routes plus the content collections is memory-heavy on its own, so the elevated
heap is required even for the API-only build.

## Build pipeline (`cli.ts build`)

`buildProject()` runs these steps before invoking Astro:

1. `updateContent()` — regenerate `src/content.ts` from the content sources
   defined in `pf-docs.config.mjs` (`createCollectionContent`).
2. `generateProps()` — generate `props.json` (component prop metadata).
3. `initializeApiIndex()` — seed `apiIndex.json` from a template if absent.
4. `transformMDContentToMDX()` — convert configured `.md` content to `.mdx`.
5. `build({ root, outDir })` — run Astro. During this pass the prerendered
   endpoints (`apiIndex.json.ts`, `iconsIndex.json.ts`) are generated, and site
   pages are included only if `BUILD_SITE=true`.
6. Copy `apiIndex.json` into the docs output so it is served as a static asset
   and can be fetched by SSR API routes at runtime.

Output goes to `<outputDir>/docs` (default `dist/docs`), which is what
`wrangler.jsonc` deploys to Cloudflare Pages.

### What the output contains

| Path in `dist/docs`         | API-only build | `--site` build |
| --------------------------- | :------------: | :------------: |
| `api/`                      |       ✓        |       ✓        |
| `apiIndex.json`             |       ✓        |       ✓        |
| `iconsIndex.json`           |       ✓        |       ✓        |
| `_worker.js`, `_routes.json`|       ✓        |       ✓        |
| `index.html`                |       —        |       ✓        |
| `components/`, `patterns/`, `foundations-and-styles/`, `extensions/` (HTML) | — | ✓ |

## API index data flow

The API index (`src/utils/apiIndex/`) exists in three forms for three contexts:

- **generate** (`generate.ts`) — builds the index from Astro content collections
  at build time (`getCollection`). Uses Node fs to write `apiIndex.json`.
- **get** (`get.ts`) — reads `apiIndex.json` from the filesystem; used in
  build-time contexts such as `getStaticPaths` and the prerendered
  `apiIndex.json.ts` endpoint.
- **fetch** (`fetch.ts`) — fetches `/apiIndex.json` over HTTP at runtime; used by
  the SSR API handlers so the large index is never bundled into the Worker.

## Deployment

`cli.ts deploy` shells out to `wrangler pages deploy`, publishing
`dist/docs` (per `wrangler.jsonc`). Because the API build is self-sufficient, a
deploy can ship the API alone or the API plus the site UI depending on which
build script produced `dist/docs`.

## Local development

`npm run start` → `cli.js start` runs `astro dev`. In dev, the
`optional-site-pages` integration always injects the site routes, so the full
site and the API are both available locally regardless of the `--site` flag.
