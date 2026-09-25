import { pascalCase } from 'change-case'
import { removeSubsection } from '../case'

/** Preserve page-name lookups, using frontmatter when the display name differs. */
export function getPrimaryPropComponent(page: string, propComponents: string[] = []): string {
  const pageName = pascalCase(removeSubsection(page))
  return propComponents.includes(pageName) ? pageName : propComponents[0] || pageName
}
