# Architecture

This document describes how `@patternfly/patternfly-doc-core` is structured, how
its build works, and how the **documentation API** and the **documentation site
UI** are decoupled so the API can be built by itself.

## Overview

The project is a single [Astro](https://astro.build/) application driven by a
thin CLI (`cli/cli.ts`). From the same source it produces two distinct things:

1. **The documentation API** — machine-readable JSON/text endpoints under
   `/api/**`, intended for LLM agents, MCP servers, and tooling.
2. **The documentation site UI** — the human-facing HTML pages (home page and
   the rendered component/pattern documentation).

The API is cheap to build. The site UI is expensive because it renders
PatternFly React components and MDX content. Therefore:

> **The API is built by default. The full site UI is opt-in (`--site`).**

## Directory layout

```
cli/                     # Build CLI (compiled to dist/cli, exposed as the package bin)
  cli.ts                 # Commands: setup, init, start, build, deploy, ...

src/
  pages/                 # Astro file-based routing — ALWAYS built
    api/**               # The documentation API (SSR + a few static routes)
    apiIndex.json.ts     # Prerendered /apiIndex.json   (API depends on this)
    iconsIndex.json.ts   # Prerendered /iconsIndex.json (icons API depends on this)
    props.json.ts        # Prerendered /props.json
    props.ts             # SSR /props endpoint
    404.astro            # Lightweight; shows API-only messaging when PF_API_ONLY=true

  site-pages/            # Site UI pages — NOT in Astro routing by default.
    index.astro          # Full home page (injected only for full-site builds)
    api-landing.astro    # Lightweight "/" stub (injected for API-only builds)
    [section]/[...page].astro     # Docs pages (heavy: React + MDX)
    [section]/[page]/[tab].astro  # Docs tab pages (heavy: React + MDX)

  components/            # React + Astro components used by site-pages
  layouts/              # Astro layouts (Main.astro pulls in PatternFly CSS + nav)
  utils/                # Shared helpers (used by both API and site)
    apiIndex/           # API index generate/get/fetch
    apiRoutes/          # Content matching, example parsing, collections
    icons/              # Icon metadata + SVG helpers
    propsData/          # Props fetch helper
  content.ts            # Generated list of content collections

astro.config.mjs        # Astro config + the `optional-site-pages` integration
wrangler.jsonc          # Cloudflare Pages config (deploy target)
pf-docs.config.mjs      # Consumer-provided docs config (content sources, outputDir)
```

## The API / site split

### Why they can be separated

The API side is self-contained. Its route handlers read only from **source**
inputs, never from the built site output:

- SSR API routes (`prerender = false`) fetch the prerendered `/apiIndex.json` at
  runtime (`src/utils/apiIndex/fetch.ts`) — keeping the Cloudflare Worker bundle
  small instead of embedding the ~500 KB index.
- Text/example routes read the original Markdown/MDX from the content source via
  `src/utils/apiRoutes/*`.
- Props routes read `props.json`; icon routes read `@patternfly/react-icons`
  static output plus the prerendered `/iconsIndex.json`.

The heavy, memory-intensive work lives exclusively in the site-UI pages under
`src/site-pages/` — the only files that import `@patternfly/react-core`,
`LiveExample`, `SectionGallery`, the layouts, and render MDX. Nothing in
`src/pages/api/**` depends on those pages being built.

### How the separation is implemented

Astro builds everything it finds under `src/pages/`. To keep the site pages out
of the default build **without breaking their relative imports**, they live in
`src/site-pages/` — a sibling directory at the *same depth* as `src/pages/`.
Because both are direct children of `src/`, every relative import inside the
moved files (`../layouts/...`, `../../components/...`, `../../content`, etc.)
resolves unchanged.

Being outside `src/pages/`, those files are no longer file-routed, so their
modules are **not part of the SSR bundle** for an API-only build.

They are added back to routing on demand by the `optional-site-pages`
integration in `astro.config.mjs`, using the Astro `command` plus an env var:

```js
'astro:config:setup': ({ command, injectRoute }) => {
  const buildFullSite = command === 'dev' || process.env.BUILD_SITE === 'true'
  if (buildFullSite) {
    injectRoute({ pattern: '/',                       entrypoint: '.../src/site-pages/index.astro' })
    injectRoute({ pattern: '/[section]/[...page]',    entrypoint: '.../src/site-pages/[section]/[...page].astro' })
    injectRoute({ pattern: '/[section]/[page]/[tab]', entrypoint: '.../src/site-pages/[section]/[page]/[tab].astro' })
  } else {
    injectRoute({ pattern: '/',                       entrypoint: '.../src/site-pages/api-landing.astro' })
  }
}
```

Rules:

- **Dev server** (`command === 'dev'`): the full site is always injected, so
  local development is unchanged.
- **Build** (`command === 'build'`): the full site is injected only when
  `BUILD_SITE=true`; otherwise a lightweight `api-landing.astro` stub is injected
  at `/` so the route still resolves without pulling in any heavy modules.

Entrypoints are resolved with
`fileURLToPath(new URL('./src/site-pages/...', import.meta.url))` so they resolve
correctly whether the package runs from this repo or from a consumer's
`node_modules`.

### Two env vars, two jobs

| Var            | Set when            | Effect                                                        |
| -------------- | ------------------- | ------------------------------------------------------------ |
| `BUILD_SITE`   | `build --site`      | Integration injects the full site routes.                    |
| `PF_API_ONLY`  | `build` (default)   | Remaining stub pages (e.g. `404.astro`) show API-only copy.  |

## CLI and scripts

`cli.ts build` is **API-only by default**; pass `--site` for the full site:

```ts
if (site) {
  process.env.BUILD_SITE = 'true'   // inject full site routes
} else {
  process.env.PF_API_ONLY = 'true'  // API-only messaging on stub pages
}
```

| Script              | Builds          | Command                                    |
| ------------------- | --------------- | ------------------------------------------ |
| `npm run build`     | API only        | `... cli.js build`                         |
| `npm run build:all` | API + site UI   | `... cli.js build --site`                  |
| `npm run start`     | Full site (dev) | `... cli.js start` → `astro dev`           |

Both build scripts run under `--max-old-space-size=8192`; SSR bundling of the API
routes plus the content collections is memory-heavy on its own, so the elevated
heap is required even for the API-only build.

## Build pipeline (`cli.ts build`)

`buildProject()` runs these steps before invoking Astro:

1. `updateContent()` — regenerate `src/content.ts` from the content sources in
   `pf-docs.config.mjs`.
2. `generateProps()` — generate `props.json` (component prop metadata).
3. `initializeApiIndex()` — seed `apiIndex.json` from a template if absent.
4. `transformMDContentToMDX()` — convert configured `.md` content to `.mdx`.
5. `build({ root, outDir })` — run Astro. Prerendered endpoints
   (`apiIndex.json.ts`, `iconsIndex.json.ts`, `props.json.ts`) are generated;
   site pages are included only when `BUILD_SITE=true`.
6. Copy `apiIndex.json` into the docs output so it can be fetched by SSR API
   routes at runtime.

Output goes to `<outputDir>/docs` (default `dist/docs`), which `wrangler.jsonc`
deploys to Cloudflare Pages.

### What the output contains

| Path in `dist/docs`         | API-only (default) | `--site`      |
| --------------------------- | :----------------: | :-----------: |
| `api/`                      |         ✓          |       ✓       |
| `apiIndex.json`, `iconsIndex.json`, `props.json` | ✓ | ✓        |
| `_worker.js`, `_routes.json`|         ✓          |       ✓       |
| `index.html`                | ✓ (stub landing)   | ✓ (full home) |
| `404.html`                  |         ✓          |       ✓       |
| `components/`, `patterns/`, `foundations-and-styles/`, `extensions/` (HTML) | — | ✓ |

### Measured build cost (this repo)

| Build            | Wall time | Peak RSS |
| ---------------- | --------- | -------- |
| API-only (`build`)   | ~44 s | ~6.7 GB |
| Full (`build:all`)   | ~57 s | ~7.2 GB |

The API-only build is faster mainly because it skips prerendering the many
component/pattern HTML pages and the client-side JS build for them. A large
portion of peak memory comes from SSR-bundling the API routes together with the
content collections, which happens in both builds.

## API index data flow

The API index (`src/utils/apiIndex/`) exists in three forms for three contexts:

- **generate** (`generate.ts`) — builds the index from Astro content collections
  at build time (`getCollection`); writes `apiIndex.json`.
- **get** (`get.ts`) — reads `apiIndex.json` from the filesystem; used in
  build-time contexts (e.g. the prerendered `apiIndex.json.ts` endpoint).
- **fetch** (`fetch.ts`) — fetches `/apiIndex.json` over HTTP at runtime; used by
  the SSR API handlers so the large index is never bundled into the Worker.

## Deployment

`cli.ts deploy` shells out to `wrangler pages deploy`, publishing `dist/docs`
(per `wrangler.jsonc`). Because the API build is self-sufficient, a deploy can
ship the API alone or the API plus the site UI, depending on which build script
produced `dist/docs`.

## Local development

`npm run start` → `cli.js start` runs `astro dev`. In dev the
`optional-site-pages` integration always injects the full site routes, so the
site and the API are both available locally.
