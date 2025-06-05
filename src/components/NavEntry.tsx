import { NavItem } from '@patternfly/react-core'
import { kebabCase } from '../utils/case'

export interface TextContentEntry {
  id: string
  data: {
    id: string
    section: string
    tab?: string
    sortValue?: number
  }
}

interface NavEntryProps {
  entry: TextContentEntry
  isActive: boolean
}

export const NavEntry = ({ entry, isActive }: NavEntryProps) => {
  const { id: contentLocationId } = entry
  const { id: entryTitle, section } = entry.data

  const kebabTitle = kebabCase(entryTitle)
  const kebabSection = kebabCase(section)

  return (
    <NavItem
      itemId={contentLocationId}
      to={`/${kebabSection}/${kebabTitle}`}
      isActive={isActive}
      id={`nav-entry-${contentLocationId}`}
    >
      {entryTitle}
    </NavItem>
  )
}
