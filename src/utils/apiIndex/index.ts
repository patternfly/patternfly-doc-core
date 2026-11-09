/**
 * API Index utilities for PatternFly documentation
 *
 * This module provides two different ways to access the API index:
 *
 * 1. Prerender (generateApiIndex): Builds from content collections and the
 *    precomputed examples snapshot. Astro emits /apiIndex.json from this result.
 *
 * 2. Runtime (fetchApiIndex): Fetches /apiIndex.json via HTTP
 *    - Used in SSR route handlers (Cloudflare Workers)
 *    - Avoids bundling 500KB+ data into Worker
 *    - Adds ~5-10ms fetch latency from CDN
 *    - Fully compatible with Workers environment
 */

export {
  generateApiIndex,
  type ApiIndex,
} from './generate'

export { getApiIndex, getVersions, getSections, getPages, getTabs, getExamples } from './get'

export { fetchApiIndex } from './fetch'
