import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'

export async function convertToMDX(globPath: string) {
  const files = await glob(globPath)

  files.forEach(async (file) => {
    const fileContent = await readFile(file, 'utf-8')

    //regex link: https://regexr.com/8f0er
    const importRegex = /(?<!```no[lL]ive\n)import {?[\w\s,\n]*}?.*\n/g

    //removes all top level imports from the md file that the old docs framework used to determine what imports are needed
    const withoutImports = fileContent.replace(importRegex, '')

    //regex link: https://regexr.com/8f0bu
    const ExampleBlockRegex =
      /```[tj]s file=['"]\.?\/?(\w*)\.(\w*)['"]\s*\n```/g

    //the first capture group is the example file name without the extension or path, the second is the extension
    const replacementString = `\nimport $1 from "./$1.$2?raw"\n\n<LiveExample src={$1} />`
    const examplesConvertedToMDX = withoutImports.replace(
      ExampleBlockRegex,
      replacementString,
    )

    //we want to strip the nolive/noLive tags from codeblocks as that was custom to the old docs framework
    const noLiveRemoved = examplesConvertedToMDX.replace(/```no[lL]ive/g, '```')

    await writeFile(file + 'x', noLiveRemoved)
  })
}
