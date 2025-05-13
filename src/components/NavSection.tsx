import { NavExpandable } from '@patternfly/react-core'
import { sentenceCase } from 'change-case'
import { NavEntry, type TextContentEntry } from './NavEntry'
import { kebabCase } from 'change-case'

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
  const isActive = entries.some((entry) => entry.id === activeItem)

  const items = entries.map((entry) => (
    <NavEntry
      key={entry.id}
      entry={entry}
      isActive={
        activeItem === entry.id ||
        window.location.pathname.includes(kebabCase(entry.data.id))
      }
    />
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
