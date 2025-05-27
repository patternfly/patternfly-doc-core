#!/usr/bin/env ts-node

import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'

async function main() {
  const files = await glob('./testContent/react/examples/*.md')
  files.forEach(async (file) => {
    const fileContent = await readFile(file, 'utf-8')

    //regex link: https://regexr.com/8f0er
    const importRegex = /(?<!```no[lL]ive\n)import {?[\w\s,\n]*}?.*\n/g
    const withoutImports = fileContent.replace(importRegex, '')

    //regex link: https://regexr.com/8f0bu
    const ExampleBlockRegex = /```[tj]s file=['"]\.\/(\w*)\.(\w*)['"]\s*\n```/g

    //the first capture group is the example file name without the extension or path, the second is the extension
    const examplesConvertedToMDX = withoutImports.replace(
      ExampleBlockRegex,
      `\nimport $1 from "./$1.$2?raw"\n\n<LiveExample src={$1} />`,
    )

    const noLiveRemoved = examplesConvertedToMDX.replace(/```no[lL]ive/g, "```")

    await writeFile(file + 'x', noLiveRemoved)
  })
}

main()
