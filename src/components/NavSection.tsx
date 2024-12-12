import { NavExpandable } from '@patternfly/react-core'
import { sentenceCase } from 'change-case'
import { NavEntry, type TextContentEntry } from './NavEntry'

interface NavSectionProps {
  entries: TextContentEntry[]
  sectionId: string
  activeItem: string
}

export const NavSection = ({
  entries,
  sectionId,
  activeItem,
}: NavSectionProps) => {
  const isExpanded = window.location.pathname.includes(sectionId)

  const sortedNavEntries = entries.sort((a, b) =>
    a.data.id.localeCompare(b.data.id),
  )

  const isActive = sortedNavEntries.some((entry) => entry.id === activeItem)

  const items = sortedNavEntries.map((entry) => (
    <NavEntry key={entry.id} entry={entry} isActive={activeItem === entry.id} />
  ))

  return (
    <NavExpandable
      title={sentenceCase(sectionId)}
      isActive={isActive}
      isExpanded={isExpanded}
      id={`nav-section-${sectionId}`}
    >
      {items}
    </NavExpandable>
  )
}
