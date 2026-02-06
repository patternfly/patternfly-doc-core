/**
 * Utilities for working with react-icons from the ESM package.
 * Icons are loaded from node_modules/react-icons icon set folders.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { IconsManifest } from 'react-icons/lib'

export interface IconMetadata {
  name: string
  reactName: string
  style: string
  usage: string
  unicode: string
  /** Set id for SVG URL: /api/icons/{set}_{reactName} */
  set?: string
}

const ICON_SET_IDS = IconsManifest.map((m) => m.id)

/** Derive style from set id and react name (e.g., fa + FaRegCircle -> "regular") */
function getStyle(setId: string, reactName: string): string {
  if (setId === 'fa' || setId === 'fa6') {
    if (reactName.startsWith('FaReg')) {
      return 'regular'
    }
    if (reactName.startsWith('FaBrands')) {
      return 'brands'
    }
    return 'solid'
  }
  return setId
}

/** Convert PascalCase to kebab-case */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/** Derive base name from react name by removing set-specific prefixes */
function getBaseName(setId: string, reactName: string): string {
  let base = reactName
  if (setId === 'fa' || setId === 'fa6') {
    base = base.replace(/^Fa(Reg|Brands)?/, '')
  } else if (setId === 'io' || setId === 'io5') {
    base = base.replace(/^Io(5)?/, '')
  } else if (setId === 'md') {
    base = base.replace(/^Md/, '')
  } else if (setId === 'hi' || setId === 'hi2') {
    base = base.replace(/^Hi(2)?/, '')
  } else {
    const setPrefix = setId.charAt(0).toUpperCase() + setId.slice(1)
    const prefix = new RegExp(`^${setPrefix}`, 'i')
    base = base.replace(prefix, '')
  }
  return toKebabCase(base) || toKebabCase(reactName)
}

/**
 * Get all icons from all sets with metadata.
 * Shape: { name, reactName, style, usage, unicode }
 */
export async function getAllIcons(): Promise<IconMetadata[]> {
  const icons: IconMetadata[] = []

  for (const setId of ICON_SET_IDS) {
    try {
      const module = await import(`react-icons/${setId}`)
      const iconNames = Object.keys(module).filter(
        (k) => typeof module[k] === 'function' && k !== 'default',
      )

      for (const reactName of iconNames) {
        icons.push({
          name: getBaseName(setId, reactName),
          reactName,
          style: getStyle(setId, reactName),
          usage: `import { ${reactName} } from 'react-icons/${setId}'`,
          unicode: '',
          set: setId,
        })
      }
    } catch {
      // Skip sets that fail to load
    }
  }

  return icons
}

/**
 * Filter icons by search term (case-insensitive match on name or reactName)
 */
export function filterIcons(
  icons: IconMetadata[],
  filter: string,
): IconMetadata[] {
  if (!filter || !filter.trim()) {
    return icons
  }
  const term = filter.toLowerCase().trim()
  return icons.filter(
    (icon) =>
      icon.name.toLowerCase().includes(term) ||
      icon.reactName.toLowerCase().includes(term),
  )
}

/**
 * Get SVG markup for all icons in a set. Used at build time for prerendering.
 * @param setId - Icon set id (e.g., "fa", "md")
 * @returns Record of iconName -> SVG string
 */
export async function getIconSvgsForSet(
  setId: string,
): Promise<Record<string, string>> {
  if (!ICON_SET_IDS.includes(setId)) {
    return {}
  }

  try {
    const module = await import(`react-icons/${setId}`)
    const svgs: Record<string, string> = {}

    for (const iconName of Object.keys(module)) {
      const IconComponent = module[iconName]
      if (typeof IconComponent !== 'function' || iconName === 'default') {
        continue
      }

      const element = React.createElement(IconComponent, {
        size: '1em',
        style: { verticalAlign: 'middle' },
      })
      svgs[iconName] = renderToStaticMarkup(element)
    }

    return svgs
  } catch {
    return {}
  }
}

/**
 * Get SVG markup for a specific icon.
 * @param setId - Icon set id (e.g., "fa", "md")
 * @param iconName - Icon component name (e.g., "FaCircle")
 */
export async function getIconSvg(
  setId: string,
  iconName: string,
): Promise<string | null> {
  if (!ICON_SET_IDS.includes(setId)) {
    return null
  }

  try {
    const module = await import(`react-icons/${setId}`)
    const IconComponent = module[iconName]
    if (typeof IconComponent !== 'function') {
      return null
    }

    const element = React.createElement(IconComponent, {
      size: '1em',
      style: { verticalAlign: 'middle' },
    })
    return renderToStaticMarkup(element)
  } catch {
    return null
  }
}

/**
 * Parse icon id "set_iconName" into { setId, iconName }
 */
export function parseIconId(iconId: string): { setId: string; iconName: string } | null {
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
