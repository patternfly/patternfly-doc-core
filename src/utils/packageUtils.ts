export const getPackageName = (filePath?: string): string => {
  if (!filePath) {
    return ''
  }

  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/')
  const splitPath = normalizedPath.split('/')

  // check if it's a scoped package or not
  if (normalizedPath.includes('node_modules/@')) {
    const scopeIndex = splitPath.findIndex((path) => path.startsWith('@'))
    const scope = splitPath[scopeIndex]
    const packageName = splitPath[scopeIndex + 1]
    return `${scope}/${packageName}`
  }

  const nodeModulesIndex = splitPath.findIndex(
    (path) => path === 'node_modules',
  )

  if (nodeModulesIndex === -1) {
    return ''
  }

  const packageName = splitPath[nodeModulesIndex + 1]
  return packageName || ''
}

export const getTabBase = (packageName: string): string => {
  switch (packageName) {
    case '@patternfly/patternfly':
      return 'html'
    case '@patternfly/react-core':
      return 'react'
    default:
      return ''
  }
}

export const addDemosOrDeprecated = (tabName: string, filePath?: string) => {
  if (!filePath || !tabName) {
    return ''
  }

  if (filePath.includes('demos') && !tabName.includes('-demos')) {
    tabName += '-demos'
  }

  if (filePath.includes('deprecated') && !tabName.includes('-deprecated')) {
    tabName += '-deprecated'
  }

  return tabName
}

export const getDefaultTab = (filePath?: string): string => {
  const packageName = getPackageName(filePath)
  const tabBase = getTabBase(packageName)

  const tab = addDemosOrDeprecated(tabBase, filePath)

  return tab
}
