import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * Converts a CSS prefix (e.g., "pf-v6-c-accordion") to a token prefix (e.g., "c_accordion")
 * 
 * @param cssPrefix - The CSS prefix from front matter
 * @returns The token prefix used in file names
 */
function cssPrefixToTokenPrefix(cssPrefix: string): string {
  // Remove "pf-v6-" prefix and replace hyphens with underscores to match the tokens.
  return cssPrefix.replace(/^pf-v6-/, '').replace(/-+/g, '_')
}

/**
 * Extracts all token objects from @patternfly/react-tokens that match a given CSS prefix
 * 
 * @param cssPrefix - The CSS prefix (e.g., "pf-v6-c-accordion")
 * @returns Array of token objects with name, value, and var properties
 */
export async function extractReactTokens(
  cssPrefix: string | string[],
): Promise<Array<{ name: string; value: string; var: string }>> {
  // Handle both single prefix and array of prefixes to support the subcomponents.
  const prefixes = Array.isArray(cssPrefix) ? cssPrefix : [cssPrefix]
  const tokenPrefixes = prefixes.map(cssPrefixToTokenPrefix)

  // Path to the react-tokens esm directory.
  const tokensDir = join(
    process.cwd(),
    'node_modules',
    '@patternfly',
    'react-tokens',
    'dist',
    'esm',
  )

  if (!existsSync(tokensDir)) {
    console.error(`Tokens directory not found: ${tokensDir}`)
    return []
  }

  // Get all files in the directory
  const files = await readdir(tokensDir)

  // Filter for .js files that match any of the token prefixes
  // Exclude componentIndex.js and main component files (like c_accordion.js without underscores after the prefix)
  const matchingFiles = files.filter((file) => {
    if (!file.endsWith('.js') || file === 'componentIndex.js') {
      return false
    }
    // Check if file starts with any of the token prefixes
    // We want individual token files (e.g., c_accordion__toggle_FontFamily.js)
    // but not the main component index file (e.g., c_accordion.js)
    return tokenPrefixes.some((prefix) => {
      if (file === `${prefix}.js`) {
        // This is the main component file, skip it
        return false
      }
      return file.startsWith(prefix)
    })
  })

  // Import and extract objects from each matching file
  const tokenObjects: Array<{ name: string; value: string; var: string }> = []

  for (const file of matchingFiles) {
    try {
      const filePath = join(tokensDir, file)
      const fileContent = await readFile(filePath, 'utf8')

      // Extract the exported object using regex
      // Pattern: export const variableName = { "name": "...", "value": "...", "var": "..." };
      // Use non-greedy match to get just the first exported const object
      const objectMatch = fileContent.match(
        /export const \w+ = \{[\s\S]*?\n\};/,
      )

      if (objectMatch) {
        // Parse the object string to extract the JSON-like object
        const objectContent = objectMatch[0]
          .replace(/export const \w+ = /, '')
          .replace(/;$/, '')

        try {
          // Use Function constructor for safe evaluation
          // The object content is valid JavaScript, so we can evaluate it
          const tokenObject = new Function(`return ${objectContent}`)() as {
            name: string
            value: string
            var: string
          }

          if (
            tokenObject &&
            typeof tokenObject === 'object' &&
            typeof tokenObject.name === 'string' &&
            typeof tokenObject.value === 'string' &&
            typeof tokenObject.var === 'string'
          ) {
            tokenObjects.push({
              name: tokenObject.name,
              value: tokenObject.value,
              var: tokenObject.var,
            })
          }
        } catch (evalError) {
          console.warn(`Failed to parse object from ${file}:`, evalError)
        }
      }
    } catch (error) {
      console.warn(`Failed to read file ${file}:`, error)
    }
  }

  // Sort by name for consistent ordering
  return tokenObjects.sort((a, b) => a.name.localeCompare(b.name))
}
