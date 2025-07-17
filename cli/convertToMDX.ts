import { readFile, writeFile, unlink, access } from 'fs/promises'
import { glob } from 'glob'
import path from 'path'

function handleTsExamples(content: string): string {
  //regex link: https://regexr.com/8f0bu
  const ExampleBlockRegex = /```[tj]s file=['"]\.?\/?(\w*)\.(\w*)['"]\s*\n```/g

  //the first capture group is the example file name without the extension or path, the second is the extension
  const replacementString = `\nimport $1 from "./$1.$2?raw"\n\n<LiveExample src={$1} />`
  return content.replace(ExampleBlockRegex, replacementString)
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
  // Remove imports that don't end in .css
  const importRegex = /^import {?[\w\s,\n]*}? from ['"](?!.*\.css['"])[^'"]*['"];?\n/gm
  return content.replace(importRegex, '')
}

function convertCommentsToMDX(content: string): string {
  return content.replace(
    /<!--([\s\S]*?)-->/g,
    (_, comment) => `{/*${comment}*/}`,
  )
}

async function fileExists(file: string): Promise<boolean> {
  return access(file).then(() => true).catch(() => false)
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
  await unlink(file)
}

export async function convertToMDX(globPath: string): Promise<void> {
  const files = await glob(globPath)
  await Promise.all(files.map(processFile))
}
