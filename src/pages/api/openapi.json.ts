/**
 * OpenAPI 3.0 Specification Endpoint
 *
 * Architecture Note:
 * This endpoint uses fetchApiIndex(url) instead of getApiIndex() to:
 * - Avoid bundling 500KB+ API index data into Cloudflare Workers
 * - Fetch /apiIndex.json (prerendered static file) at runtime
 * - Keep Workers bundle small (~110K vs 500KB+)
 * - Add only ~5-10ms latency from CDN fetch
 */
import type { APIRoute } from 'astro'
import { fetchApiIndex } from '../../utils/apiIndex/fetch'
import { createJsonResponse } from '../../utils/apiHelpers'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  let versions: string[]
  try {
    const index = await fetchApiIndex(url)
    versions = index.versions
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Failed to load API index', details },
      500
    )
  }

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'PatternFly Documentation API',
      description:
        'Machine-readable documentation API for LLM agents and MCP servers. Provides hierarchical access to PatternFly documentation content.',
      version: '1.0.0',
      contact: {
        name: 'PatternFly',
        url: 'https://patternfly.org',
      },
    },
    servers: [
      {
        url: '/api',
        description: 'Documentation API base path',
      },
    ],
    paths: {
      '/': {
        get: {
          summary: 'Get API documentation',
          description:
            'Returns self-documenting API schema with complete endpoint descriptions, parameters, and usage examples',
          operationId: 'getApiDocs',
          responses: {
            '200': {
              description: 'API documentation schema',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      version: { type: 'string' },
                      baseUrl: { type: 'string' },
                      endpoints: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                      usage: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/versions': {
        get: {
          summary: 'List available versions',
          description: 'Returns an array of available documentation versions',
          operationId: 'getVersions',
          responses: {
            '200': {
              description: 'List of available versions',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    example: versions,
                  },
                },
              },
            },
          },
        },
      },
      '/openapi.json': {
        get: {
          summary: 'Get OpenAPI specification',
          description: 'Returns the complete OpenAPI 3.0 specification for this API',
          operationId: 'getOpenApiSpec',
          responses: {
            '200': {
              description: 'OpenAPI 3.0 specification',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    description: 'Full OpenAPI 3.0 specification',
                  },
                },
              },
            },
          },
        },
      },
      '/{version}': {
        get: {
          summary: 'List sections for a version',
          description:
            'Returns an array of available documentation sections for the specified version',
          operationId: 'getSections',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
          ],
          responses: {
            '200': {
              description: 'List of available sections',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  example: ['components', 'layouts', 'utilities'],
                },
              },
            },
            '404': {
              description: 'Version not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}': {
        get: {
          summary: 'List pages in a section',
          description:
            'Returns an array of page IDs within the specified section',
          operationId: 'getPages',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
          ],
          responses: {
            '200': {
              description: 'List of page IDs (kebab-cased)',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  example: ['alert', 'button', 'card'],
                },
              },
            },
            '404': {
              description: 'Section not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}/{page}': {
        get: {
          summary: 'List tabs for a page',
          description:
            'Returns an array of available tab slugs for the specified page',
          operationId: 'getTabs',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              description: 'Page ID (kebab-cased)',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
          ],
          responses: {
            '200': {
              description: 'List of available tab slugs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  example: ['react', 'react-demos', 'html'],
                },
              },
            },
            '404': {
              description: 'Page not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}/{page}/{tab}': {
        get: {
          summary: 'Validate and redirect to text endpoint',
          description:
            'Validates the path parameters and redirects to the /text endpoint',
          operationId: 'validateTab',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              description: 'Page ID (kebab-cased)',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              description: 'Tab slug',
              schema: {
                type: 'string',
              },
              example: 'react',
            },
          ],
          responses: {
            '302': {
              description: 'Redirects to /{version}/{section}/{page}/{tab}/text',
            },
            '404': {
              description: 'Tab not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}/{page}/{tab}/text': {
        get: {
          summary: 'Get tab content',
          description:
            'Returns the raw markdown/MDX documentation content for the specified tab',
          operationId: 'getContent',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              description: 'Page ID (kebab-cased)',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              description: 'Tab slug',
              schema: {
                type: 'string',
              },
              example: 'react',
            },
          ],
          responses: {
            '200': {
              description: 'Raw markdown/MDX content',
              content: {
                'text/plain; charset=utf-8': {
                  schema: {
                    type: 'string',
                  },
                  example:
                    '---\ntitle: Alert\nsection: components\n---\n\n## Overview\n\nAn alert is a notification that provides...',
                },
              },
            },
            '404': {
              description: 'Tab not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}/{page}/{tab}/examples': {
        get: {
          summary: 'List available examples',
          description:
            'Returns an array of available examples with their names and titles',
          operationId: 'getExamples',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              description: 'Page ID (kebab-cased)',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              description: 'Tab slug',
              schema: {
                type: 'string',
              },
              example: 'react',
            },
          ],
          responses: {
            '200': {
              description: 'List of examples',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        exampleName: {
                          type: 'string',
                        },
                        title: {
                          type: 'string',
                          nullable: true,
                        },
                      },
                    },
                  },
                  example: [
                    { exampleName: 'AlertBasic', title: 'Basic' },
                    { exampleName: 'AlertVariations', title: 'Variations' },
                  ],
                },
              },
            },
            '400': {
              description: 'Missing required parameters',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/{section}/{page}/{tab}/examples/{example}': {
        get: {
          summary: 'Get example code',
          description:
            'Returns the raw source code for a specific example',
          operationId: 'getExampleCode',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'section',
              in: 'path',
              required: true,
              description: 'Documentation section',
              schema: {
                type: 'string',
              },
              example: 'components',
            },
            {
              name: 'page',
              in: 'path',
              required: true,
              description: 'Page ID (kebab-cased)',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
            {
              name: 'tab',
              in: 'path',
              required: true,
              description: 'Tab slug',
              schema: {
                type: 'string',
              },
              example: 'react',
            },
            {
              name: 'example',
              in: 'path',
              required: true,
              description: 'Example name',
              schema: {
                type: 'string',
              },
              example: 'AlertBasic',
            },
          ],
          responses: {
            '200': {
              description: 'Raw example code',
              content: {
                'text/plain; charset=utf-8': {
                  schema: {
                    type: 'string',
                  },
                  example:
                    'import React from \'react\';\nimport { Alert } from \'@patternfly/react-core\';\n\nexport const AlertBasic = () => <Alert title="Basic alert" />;',
                },
              },
            },
            '404': {
              description: 'Example not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/tokens': {
        get: {
          summary: 'List token categories',
          description:
            'Returns an alphabetically sorted array of available design token categories from @patternfly/react-tokens. Categories are determined by token name prefixes (e.g., c_, t_, chart_). Optimized for MCP/LLM consumption.',
          operationId: 'getTokenCategories',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
          ],
          responses: {
            '200': {
              description: 'List of token categories',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                  },
                  example: ['c', 'chart', 'global', 'hidden', 'l', 't'],
                },
              },
            },
            '404': {
              description: 'Version not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/tokens/{category}': {
        get: {
          summary: 'Get tokens for a category',
          description:
            'Returns design tokens for a specific category with optional filtering. Each token includes name (CSS variable name), value (resolved value), and var (CSS var() reference). Use the filter query parameter for case-insensitive substring matching to minimize response size.',
          operationId: 'getTokensByCategory',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'category',
              in: 'path',
              required: true,
              description: 'Token category (e.g., c, t, chart)',
              schema: {
                type: 'string',
              },
              example: 'c',
            },
            {
              name: 'filter',
              in: 'query',
              required: false,
              description: 'Case-insensitive substring filter to match against token names',
              schema: {
                type: 'string',
              },
              example: 'alert',
            },
          ],
          responses: {
            '200': {
              description: 'Array of tokens matching the criteria',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                          description: 'CSS variable name',
                        },
                        value: {
                          type: 'string',
                          description: 'Resolved CSS value',
                        },
                        var: {
                          type: 'string',
                          description: 'CSS var() reference',
                        },
                      },
                      required: ['name', 'value', 'var'],
                    },
                  },
                  example: [
                    {
                      name: '--pf-v6-c-alert--Color',
                      value: '#000',
                      var: 'var(--pf-v6-c-alert--Color)',
                    },
                  ],
                },
              },
            },
            '404': {
              description: 'Category not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                      validCategories: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/{version}/tokens/all': {
        get: {
          summary: 'Get all tokens grouped by category',
          description:
            'Returns all design tokens organized by category with optional filtering. Use the filter query parameter to minimize response size for MCP/LLM consumption. Empty categories are excluded from filtered results.',
          operationId: 'getAllTokens',
          parameters: [
            {
              name: 'version',
              in: 'path',
              required: true,
              description: 'Documentation version',
              schema: {
                type: 'string',
                enum: versions,
              },
              example: 'v6',
            },
            {
              name: 'filter',
              in: 'query',
              required: false,
              description: 'Case-insensitive substring filter to match against token names across all categories',
              schema: {
                type: 'string',
              },
              example: 'color',
            },
          ],
          responses: {
            '200': {
              description: 'Object with category keys and token arrays as values',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    additionalProperties: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: {
                            type: 'string',
                            description: 'CSS variable name',
                          },
                          value: {
                            type: 'string',
                            description: 'Resolved CSS value',
                          },
                          var: {
                            type: 'string',
                            description: 'CSS var() reference',
                          },
                        },
                        required: ['name', 'value', 'var'],
                      },
                    },
                  },
                  example: {
                    c: [
                      {
                        name: '--pf-v6-c-alert--Color',
                        value: '#000',
                        var: 'var(--pf-v6-c-alert--Color)',
                      },
                    ],
                    t: [
                      {
                        name: '--pf-v6-t-global--Color',
                        value: '#333',
                        var: 'var(--pf-v6-t-global--Color)',
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Version not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Documentation',
        description: 'PatternFly documentation endpoints',
      },
    ],
  }

  const body = JSON.stringify(openApiSpec, null, 2)
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      Date: new Date().toUTCString(),
      'Content-Length': body.length.toString(),
    },
  })
}
