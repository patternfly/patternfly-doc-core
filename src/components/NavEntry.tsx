import { NavItem } from '@patternfly/react-core'
import { kebabCase } from 'change-case'

export interface TextContentEntry {
  id: string
  data: {
    id: string
    section: string
    title?: string
    tab?: string
    sortValue?: number
  }
}

interface NavEntryProps {
  entry: TextContentEntry
  isActive: boolean
}

export const NavEntry = ({ entry, isActive }: NavEntryProps) => {
  const { id } = entry
  const { id: entryId, section, title } = entry.data

  const _id =
    section === 'components' || section === 'layouts' ? kebabCase(entryId) : id

  const displayName = entryId === 'landing' ? title : entryId // landing pages must specify a title

  return (
    <NavItem
      itemId={_id}
      to={`/${section}/${_id}`}
      isActive={isActive}
      id={`nav-entry-${_id}`}
    >
      {displayName}
    </NavItem>
  )
}
