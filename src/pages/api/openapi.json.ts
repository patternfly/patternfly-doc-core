import type { APIRoute } from 'astro'
import index from 'outputDir/apiIndex.json'

export const prerender = false

export const GET: APIRoute = async () => {
  const versions = index.versions

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
