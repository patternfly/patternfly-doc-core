/**
 * PatternFly Documentation API
 *
 * Architecture:
 * - Build-time: Static API index generated from content collections (data.ts)
 * - Runtime: Routes fetch /apiIndex.json (prerendered static file) via HTTP
 * - Workers-compatible: No Node.js filesystem APIs in SSR handlers
 * - Optimized bundle: Runtime handlers don't bundle the 500KB+ index data
 * - Flattened structure: Subsections are kebab-cased and encoded into page names with underscores (e.g., "forms_checkbox")
 *
 * Data Flow:
 * 1. Build: generateApiIndex() → data.ts + apiIndex.json
 * 2. Static paths: getStaticPaths() uses getApiIndex() (build-time import)
 * 3. SSR handlers: GET handlers use fetchApiIndex(url) (runtime fetch)
 */
import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../utils/apiHelpers'

export const prerender = false

export const GET: APIRoute = async () =>
  createJsonResponse({
      name: 'PatternFly Documentation API',
      description: 'Machine-readable documentation API for LLM agents and MCP servers',
      version: '1.0.0',
      baseUrl: '/api',
      endpoints: [
        {
          path: '/api',
          method: 'GET',
          description: 'Get API schema and documentation',
          returns: {
            type: 'object',
            description: 'API schema with endpoints and usage information',
          },
        },
        {
          path: '/api/versions',
          method: 'GET',
          description: 'List available documentation versions',
          returns: {
            type: 'array',
            items: 'string',
            example: ['v6'],
          },
        },
        {
          path: '/api/openapi.json',
          method: 'GET',
          description: 'Get OpenAPI 3.0 specification',
          returns: {
            type: 'object',
            description: 'Full OpenAPI 3.0 specification for this API',
          },
        },
        {
          path: '/api/{version}',
          method: 'GET',
          description: 'List available sections for a specific version',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
          ],
          returns: {
            type: 'array',
            items: 'string',
            example: ['components', 'layouts', 'patterns', 'utility-classes'],
          },
        },
        {
          path: '/api/{version}/{section}',
          method: 'GET',
          description: 'List available pages within a section (includes underscore-separated subsection pages)',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
          ],
          returns: {
            type: 'array',
            items: 'string',
            description: 'Array of page IDs. Subsection pages use underscore-separated format: subsection_page',
            example: ['alert', 'button', 'forms_checkbox', 'forms_radio', 'menus_dropdown'],
          },
        },
        {
          path: '/api/{version}/{section}/names',
          method: 'GET',
          description: 'Get component names that have props data',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            }
          ],
          returns: {
            type: 'array',
            items: 'string',
            description: 'All component names with props data',
            example: [
              'Alert',
              'AlertGroup'
            ],
          },
        },
        {
          path: '/api/{version}/{section}/{page}',
          method: 'GET',
          description: 'List available tabs for a page (page may be underscore-separated for subsection pages)',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages like "forms_checkbox")',
              example: 'alert or forms_checkbox',
            },
          ],
          returns: {
            type: 'array',
            items: 'string',
            description: 'Array of tab slugs available for this page',
            example: ['react', 'react-demos', 'html'],
          },
        },
        {
          path: '/api/{version}/{section}/{page}/props',
          method: 'GET',
          description: 'Get props for a specific component. Automatically handles subsection-prefixed page names by removing the subsection prefix before lookup.',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages like "forms_checkbox"). Subsection prefix is automatically removed for props lookup.',
              example: 'alert or forms_checkbox',
            },
          ],
          returns: {
            type: 'array',
            items: 'object',
            description: 'Props for a specific component',
            example: [
              {
                name: 'actionClose',
                type: 'React.ReactNode',
                description: 'Close button; use the alert action close button component.',
              },
            ],
          },
        },
        {
          path: '/api/{version}/{section}/{page}/css',
          method: 'GET',
          description: 'Get CSS tokens for a specific page',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              example: 'alert',
            },
          ],
          returns: {
            type: 'array',
            items: 'object',
            description: 'Array of CSS token objects with tokenName, value, and variableName',
            example: [
              { name: 'c_alert__Background', value: '#000000', var: 'c_alert__Background' },  
            ],
          },
        },
        {
          path: '/api/{version}/{section}/{page}/{tab}',
          method: 'GET',
          description: 'Redirects to /text endpoint for the specified tab',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages)',
              example: 'alert or forms_checkbox',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              type: 'string',
              example: 'react',
            },
          ],
          returns: {
            type: 'redirect',
            description: '302 redirect to /{version}/{section}/{page}/{tab}/text',
          },
        },
        {
          path: '/api/{version}/{section}/{page}/{tab}/text',
          method: 'GET',
          description: 'Get raw markdown/MDX content for a specific tab',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages)',
              example: 'alert or forms_checkbox',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              type: 'string',
              example: 'react',
            },
          ],
          returns: {
            type: 'string',
            contentType: 'text/plain; charset=utf-8',
            description: 'Raw markdown/MDX documentation content',
          },
        },
        {
          path: '/api/{version}/{section}/{page}/{tab}/examples',
          method: 'GET',
          description: 'Get list of available examples for a tab',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages)',
              example: 'alert or forms_checkbox',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              type: 'string',
              example: 'react',
            },
          ],
          returns: {
            type: 'array',
            items: 'object',
            description: 'Array of example objects with exampleName and title',
            example: [
              { exampleName: 'AlertBasic', title: 'Basic' },
              { exampleName: 'AlertVariations', title: 'Variations' },
            ],
          },
        },
        {
          path: '/api/{version}/{section}/{page}/{tab}/examples/{example}',
          method: 'GET',
          description: 'Get raw code for a specific example',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              type: 'string',
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              type: 'string',
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              type: 'string',
              description: 'Page ID (may be underscore-separated for subsection pages)',
              example: 'alert or forms_checkbox',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              type: 'string',
              example: 'react',
            },
            {
              name: 'example',
              in: 'path',
              required: true,
              type: 'string',
              example: 'AlertBasic',
            },
          ],
          returns: {
            type: 'string',
            contentType: 'text/plain; charset=utf-8',
            description: 'Raw example code',
          },
        },
      ],
      usage: {
        description: 'Navigate the API hierarchically to discover and retrieve documentation. Subsections are kebab-cased and flattened into page names using underscore separators (e.g., "forms_checkbox" represents the checkbox page in the forms subsection).',
        exampleFlowRegularPage: [
          'GET /api/versions → ["v6"]',
          'GET /api/v6 → ["components", "layouts", ...]',
          'GET /api/v6/components → ["alert", "button", "forms_checkbox", ...]',
          'GET /api/v6/components/alert → ["react", "html", ...]',
          'GET /api/v6/components/alert/react → 302 redirect to /text',
          'GET /api/v6/components/alert/react/text → (markdown content)',
          'GET /api/v6/components/alert/react/examples → [{exampleName, title}, ...]',
          'GET /api/v6/components/alert/react/examples/AlertBasic → (example code)',
        ],
        exampleFlowSubsectionPage: [
          'GET /api/v6 → ["components", "layouts", ...]',
          'GET /api/v6/components → ["alert", "forms_checkbox", "forms_radio", ...]',
          'GET /api/v6/components/forms_checkbox → ["react", "html", ...]',
          'GET /api/v6/components/forms_checkbox/react → 302 redirect to /text',
          'GET /api/v6/components/forms_checkbox/react/text → (markdown content)',
          'GET /api/v6/components/forms_checkbox/react/examples → [{exampleName, title}, ...]',
          'GET /api/v6/components/forms_checkbox/react/examples/CheckboxBasic → (example code)',
        ],
        architecture: {
          buildTime: 'Static index generated to data.ts and apiIndex.json',
          runtime: 'SSR routes fetch /apiIndex.json to avoid bundling data into Workers',
          optimization: 'Workers bundle is ~110K instead of 500KB+ with embedded data',
          flattenedStructure: 'Subsections are kebab-cased and encoded into page names with underscores (e.g., "forms_checkbox")',
        },
      },
    })
