import { NavItem } from '@patternfly/react-core'

export interface TextContentEntry {
  id: string
  data: {
    id: string
    section: string
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

  return (
    <NavItem itemId={id} to={`/${section}/${id}`} isActive={isActive} id={`nav-entry-${id}`}>
      {entryTitle}
    </NavItem>
  )
}
