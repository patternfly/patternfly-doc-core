/**
 * Extracts import statements from file content
 * Matches import statements with relative paths (starting with ./ or ../)
 *
 * @param fileContent - The file content to parse
 * @returns Array of import statements or null if none found
 */
export function extractImports(fileContent: string): string[] | null {
  // Match import statements with relative paths
  // Supports: import X from './path', import X from "../path/file.tsx"
  const importRegex = /import\s+.*\s+from\s+['"]\.{1,2}\/[^'"]+['"]/gm
  const matches = fileContent.match(importRegex)
  return matches
}

/**
 * Extracts the file path for a specific example from import statements
 * Looks for imports that reference the example name using word boundaries to avoid substring matches
 *
 * @param imports - Array of import statements
 * @param exampleName - Name of the example to find (must be a valid React component name)
 * @returns Relative file path without quotes (including query params like ?raw), or null if not found
 */
export function extractExampleFilePath(imports: string[], exampleName: string): string | null {
  // Use word boundaries to match exact example names (e.g., "AlertBasic" won't match "AlertBasicExpanded")
  // No escaping needed - React component names can only contain [A-Za-z0-9_]
  const wordRegex = new RegExp(`\\b${exampleName}\\b`)
  const exampleImport = imports.find((imp) => wordRegex.test(imp))

  if (!exampleImport) {
    // eslint-disable-next-line no-console
    console.error('No import path found for example', exampleName)
    return null
  }

  // Extract path from import statement, handling query parameters like ?raw
  // Matches: "./path" or "../path" with optional file extensions and query params
  const match = exampleImport.match(/['"](\.[^'"]+)['"]/i)
  if (!match || !match[1]) {
    return null
  }
  return match[1]
}
