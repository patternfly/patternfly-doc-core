import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'
import { fileExists } from './fileExists.js'

function handleTsExamples(content: string): string {
  // File fences may include options before or after file=, and refer to sibling packages.
  // Only convert empty fences; inline code samples should remain code blocks.
  const exampleBlockRegex = /^ {0,3}([`~]{3,})[tj]sx?\b([^\r\n]*)\r?\n(?:[ \t]*\r?\n)*[ \t]*([`~]+[ \t]*)$/gm
  const imports = new Map<string, string>()
  const names = new Set<string>()

  return content.replace(exampleBlockRegex, (block, openingFence: string, attributes: string, closingFence: string) => {
    const closingMarker = closingFence.trim()
    if (!/^`+$|^~+$/.test(openingFence) ||
      !closingMarker.startsWith(openingFence) ||
      !new RegExp(`^${openingFence[0]}+$`).test(closingMarker)) {
      return block
    }

    const file = attributes.match(/\bfile=(['"])([^'"\r\n]+\.[tj]sx?)\1/)
    if (!file) {
      return block
    }

    const filePath = file[2].startsWith('.') ? file[2] : `./${file[2]}`
    let name = imports.get(filePath)
    let importStatement = ''
    if (!name) {
      const baseName = path.basename(filePath, path.extname(filePath)).replace(/\W/g, '_')
      const identifier = /^[A-Za-z_]/.test(baseName) ? baseName : `Example_${baseName}`
      name = identifier
      let suffix = 2
      while (names.has(name)) {
        name = `${identifier}_${suffix++}`
      }
      names.add(name)
      imports.set(filePath, name)
      importStatement = `\nimport ${name} from ${JSON.stringify(`${filePath}?raw`)}\n`
    }

    return `${importStatement}\n<LiveExample src={${name}} />`
  })
}

async function handleHTMLExamples(
  content: string,
  fileDir: string,
): Promise<string> {
  const htmlCodeFenceRegex = /```html\n([\s\S]*?)\n```/g
  const matches = Array.from(content.matchAll(htmlCodeFenceRegex))

  const replacements = await Promise.all(
    matches.map(async (match, index) => {
      const htmlContent = match[1]
      const exampleName = `Example${index + 1}`
      const htmlFilePath = path.join(fileDir, `${exampleName}.html`)

      await writeFile(htmlFilePath, htmlContent)

      return {
        original: match[0],
        replacement: `\nimport ${exampleName} from './${exampleName}.html?raw'\n\n<LiveExample html={${exampleName}} />`,
      }
    }),
  )

  return replacements.reduce(
    (result, { original, replacement }) =>
      result.replace(original, replacement),
    content,
  )
}

function removeNoLiveTags(content: string): string {
  return content.replace(/```no[lL]ive/g, '```')
}

function removeExistingImports(content: string): string {
  // Remove imports that are absolute and not CSS
  const importRegex = /^import {?[\w\s,\n]*}? from ['"](?!\.\.?\/)(?!.*\.css['"])[^'"]*['"];?\n/gm
  return content.replace(importRegex, '')
}

function convertCommentsToMDX(content: string): string {
  return content.replace(
    /<!--([\s\S]*?)-->/g,
    (_, comment) => `{/*${comment}*/}`,
  )
}

async function processFile(file: string): Promise<void> {
  const exists = await fileExists(file)

  // if the file is already an mdx file or doesn't exist we don't need to do anything
  if (file.endsWith('.mdx') || !exists) {
    return
  }

  const fileContent = await readFile(file, 'utf-8')
  const fileDir = path.dirname(file)

  const transformations = [
    removeNoLiveTags,
    removeExistingImports,
    (content: string) => handleHTMLExamples(content, fileDir),
    handleTsExamples,
    convertCommentsToMDX,
  ]

  const processedContent = await transformations.reduce(
    async (contentPromise, transform) => {
      const content = await contentPromise
      return transform(content)
    },
    Promise.resolve(fileContent),
  )

  await writeFile(file + 'x', processedContent)
}

export async function convertToMDX(globPath: string): Promise<void> {
  const files = await glob(globPath)
  await Promise.all(files.map(processFile))
}
