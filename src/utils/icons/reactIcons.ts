/**
 * Utilities for working with @patternfly/react-icons.
 * Icons are loaded from @patternfly/react-icons/dist/static (SVG files).
 */
import fs from 'node:fs'
import path from 'node:path'
import { IconMetadata, PF_ICONS_SET_ID } from './icons'
/** Resolve path to @patternfly/react-icons/dist/static. Uses cwd so it works in dev and build. */
function getStaticIconsDir(): string {
  return path.join(
    process.cwd(),
    'node_modules',
    '@patternfly',
    'react-icons',
    'dist',
    'static',
  )
}

/** Convert kebab-case filename (no .svg) to PatternFly React component name (PascalCase + "Icon"). */
function kebabToReactName(kebab: string): string {
  const pascal = kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('')
  return pascal + 'Icon'
}

/** Convert React component name back to kebab-case (without "Icon" suffix). */
function reactNameToKebab(reactName: string): string {
  const withoutIcon = reactName.replace(/Icon$/, '')
  return withoutIcon
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * Get all icons from @patternfly/react-icons/dist/static with metadata.
 * Shape: { name, reactName, usage }
 */
export async function getAllIcons(): Promise<IconMetadata[]> {
  const staticDir = getStaticIconsDir()
  if (!fs.existsSync(staticDir)) {
    return []
  }

  const files = fs.readdirSync(staticDir)
  const svgFiles = files.filter((f) => f.endsWith('.svg'))
  const icons: IconMetadata[] = []

  for (const file of svgFiles) {
    const name = file.replace(/\.svg$/, '')
    const reactName = kebabToReactName(name)
    icons.push({
      name,
      reactName,
      usage: `import { ${reactName} } from '@patternfly/react-icons'`,
    })
  }

  return icons
}

/**
 * Get SVG markup for all PatternFly icons (single set).
 * Used at build time for prerendering.
 * @param setId - Must be "pf" for PatternFly icons
 * @returns Record of reactName -> SVG string
 */
export async function getIconSvgsForSet(
  setId: string,
): Promise<Record<string, string>> {
  if (setId !== PF_ICONS_SET_ID) {
    return {}
  }

  const staticDir = getStaticIconsDir()
  if (!fs.existsSync(staticDir)) {
    return {}
  }

  const files = fs.readdirSync(staticDir)
  const svgFiles = files.filter((f) => f.endsWith('.svg'))
  const svgs: Record<string, string> = {}

  for (const file of svgFiles) {
    const name = file.replace(/\.svg$/, '')
    const reactName = kebabToReactName(name)
    const filePath = path.join(staticDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    svgs[reactName] = content.trim()
  }

  return svgs
}

/**
 * Get SVG markup for a specific icon.
 * @param setId - Must be "pf"
 * @param iconName - React component name (e.g., "AccessibleIconIcon")
 */
export async function getIconSvg(
  setId: string,
  iconName: string,
): Promise<string | null> {
  if (setId !== PF_ICONS_SET_ID) {
    return null
  }

  const kebab = reactNameToKebab(iconName)
  const fileName = `${kebab}.svg`
  const staticDir = getStaticIconsDir()
  const filePath = path.join(staticDir, fileName)

  if (!fs.existsSync(filePath)) {
    return null
  }

  return fs.readFileSync(filePath, 'utf-8').trim()
}

/**
 * Parse icon id "set_iconName" into { setId, iconName }
 */
export function parseIconId(
  iconId: string,
): { setId: string; iconName: string } | null {
  const underscoreIndex = iconId.indexOf('_')
  if (underscoreIndex <= 0) {
    return null
  }

  const setId = iconId.slice(0, underscoreIndex)
  const iconName = iconId.slice(underscoreIndex + 1)
  if (!setId || !iconName) {
    return null
  }

  return { setId, iconName }
}
