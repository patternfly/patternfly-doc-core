/**
 * API Index utilities for PatternFly documentation
 *
 * This module provides two different ways to access the API index:
 *
 * 1. Build-time (getApiIndex): Imports static data from data.ts
 *    - Used in getStaticPaths() and other build-time code
 *    - Has access to Node.js filesystem APIs
 *    - Bundles data into the module
 *
 * 2. Runtime (fetchApiIndex): Fetches /apiIndex.json via HTTP
 *    - Used in SSR route handlers (Cloudflare Workers)
 *    - Avoids bundling 500KB+ data into Worker
 *    - Adds ~5-10ms fetch latency from CDN
 *    - Fully compatible with Workers environment
 */

export {
  generateApiIndex,
  writeApiIndex,
  generateAndWriteApiIndex,
  type ApiIndex,
} from './generate'

export { getApiIndex, getVersions, getSections, getPages, getTabs, getExamples } from './get'

export { fetchApiIndex } from './fetch'
