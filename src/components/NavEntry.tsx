import { NavItem } from '@patternfly/react-core'
import { kebabCase } from 'change-case'

export interface TextContentEntry {
  id: string
  data: {
    id: string
    section: string
    tab?: string
  }
  collection: string
}

interface NavEntryProps {
  entry: TextContentEntry
  isActive: boolean
}

export const NavEntry = ({ entry, isActive }: NavEntryProps) => {
  const { id } = entry
  const { id: entryTitle, section } = entry.data

  const _id = section === 'components' ? kebabCase(entryTitle) : id
  return (
    <NavItem
      itemId={_id}
      to={`/${section}/${_id}`}
      isActive={isActive}
      id={`nav-entry-${_id}`}
    >
      {entryTitle}
    </NavItem>
  )
}
