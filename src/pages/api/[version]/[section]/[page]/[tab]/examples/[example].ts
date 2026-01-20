/* eslint-disable no-console */
import type { APIRoute, GetStaticPaths } from 'astro'
import { readFile } from 'fs/promises'
import { resolve } from 'path'
import { createJsonResponse, createTextResponse } from '../../../../../../../utils/apiHelpers'
import { generateAndWriteApiIndex } from '../../../../../../../utils/apiIndex/generate'
import { getEnrichedCollections } from '../../../../../../../utils/apiRoutes/collections'
import { findContentEntryFilePath } from '../../../../../../../utils/apiRoutes/contentMatching'
import { extractImports, extractExampleFilePath } from '../../../../../../../utils/apiRoutes/exampleParsing'

export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  // Generate index file (will be cached if already generated)
  const index = await generateAndWriteApiIndex()

  const paths: {
    params: {
      version: string
      section: string
      page: string
      tab: string
      example: string
    }
  }[] = []

  // Build paths from index structure by iterating over examples
  // All examples are keyed by version::section::page::tab (page may be underscore-separated like "forms_checkbox")
  for (const [exampleKey, examples] of Object.entries(index.examples)) {
    const parts = exampleKey.split('::')

    if (parts.length === 4) {
      const [version, section, page, tab] = parts
      for (const example of examples) {
        paths.push({
          params: {
            version,
            section,
            page,
            tab,
            example: example.exampleName,
          },
        })
      }
    }
  }

  return paths
}

/**
 * GET handler for retrieving example source code
 * Returns the raw source code for a specific example
 *
 * @param params - Route parameters: version, section, page, tab, example
 * @returns Response with example code as text/plain or error JSON
 */
export const GET: APIRoute = async ({ params }) => {
  const { version, section, page, tab, example } = params
  if (!version || !section || !page || !tab || !example) {
    return createJsonResponse(
      { error: 'All parameters are required' },
      400
    )
  }

  try {
    const collections = await getEnrichedCollections(version)
    const contentEntryFilePath = findContentEntryFilePath(collections, {
      section,
      page,
      tab
    })

    if (!contentEntryFilePath) {
      return createJsonResponse(
        { error: `Content entry not found for ${version}/${section}/${page}/${tab}` },
        404
      )
    }

    // Read content entry file to extract imports
    let contentEntryFileContent: string
    try {
      contentEntryFileContent = await readFile(contentEntryFilePath, 'utf8')
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      return createJsonResponse(
        { error: 'Failed to read content entry file', details },
        500
      )
    }

    const contentEntryImports = extractImports(contentEntryFileContent)
    if (!contentEntryImports) {
      return createJsonResponse(
        { error: 'No imports found in content entry' },
        404
      )
    }

    const relativeExampleFilePath = extractExampleFilePath(contentEntryImports, example)
    if (!relativeExampleFilePath) {
      return createJsonResponse(
        { error: `Example "${example}" not found in imports` },
        404
      )
    }

    // Strip query parameters (like ?raw) from the file path before reading
    const cleanFilePath = relativeExampleFilePath.split('?')[0]

    // Read example file
    const absoluteExampleFilePath = resolve(contentEntryFilePath, '../', cleanFilePath)
    let exampleFileContent: string
    try {
      exampleFileContent = await readFile(absoluteExampleFilePath, 'utf8')
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error)
      // Check if it's a file not found error
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return createJsonResponse(
          { error: `Example file not found at path: ${relativeExampleFilePath}` },
          404
        )
      }
      return createJsonResponse(
        { error: 'Failed to read example file', details },
        500
      )
    }

    return createTextResponse(exampleFileContent)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    return createJsonResponse(
      { error: 'Internal server error', details },
      500
    )
  }
}