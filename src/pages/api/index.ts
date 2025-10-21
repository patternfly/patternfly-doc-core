import type { APIRoute } from 'astro'
import { createJsonResponse } from '../../utils/apiHelpers'

export const prerender = false

export const GET: APIRoute = async () =>
  createJsonResponse({
      name: 'PatternFly Documentation API',
      description: 'Machine-readable documentation API for LLM agents and MCP servers',
      version: '1.0.0',
      baseUrl: '/text',
      endpoints: [
        {
          path: '/text',
          method: 'GET',
          description: 'Get API schema and documentation',
          returns: {
            type: 'object',
            description: 'API schema with endpoints and usage information',
          },
        },
        {
          path: '/text/versions',
          method: 'GET',
          description: 'List available documentation versions',
          returns: {
            type: 'array',
            items: 'string',
            example: ['v6'],
          },
        },
        {
          path: '/text/openapi.json',
          method: 'GET',
          description: 'Get OpenAPI 3.0 specification',
          returns: {
            type: 'object',
            description: 'Full OpenAPI 3.0 specification for this API',
          },
        },
        {
          path: '/text/{version}',
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
            example: ['components', 'layouts', 'utilities'],
          },
        },
        {
          path: '/text/{version}/{section}',
          method: 'GET',
          description: 'List available pages within a section',
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
            description: 'Array of kebab-cased page IDs',
            example: ['alert', 'button', 'card'],
          },
        },
        {
          path: '/text/{version}/{section}/{page}',
          method: 'GET',
          description: 'List available tabs for a page',
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
            items: 'string',
            description: 'Array of tab slugs',
            example: ['react', 'react-demos', 'html'],
          },
        },
        {
          path: '/text/{version}/{section}/{page}/{tab}',
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
              example: 'alert',
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
      ],
      usage: {
        description: 'Navigate the API hierarchically to discover and retrieve documentation',
        exampleFlow: [
          'GET /text/versions → ["v6"]',
          'GET /text/v6 → ["components", "layouts", ...]',
          'GET /text/v6/components → ["alert", "button", ...]',
          'GET /text/v6/components/alert → ["react", "html", ...]',
          'GET /text/v6/components/alert/react → (markdown content)',
        ],
      },
    })
