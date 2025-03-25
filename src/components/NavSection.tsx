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

  const sortedNavEntries = entries.sort((a, b) =>
    a.data.id.localeCompare(b.data.id),
  )

  const isActive = sortedNavEntries.some((entry) => entry.id === activeItem)

  let navItems = sortedNavEntries
  if (sectionId === 'components') {
    navItems = [
      ...sortedNavEntries
        .reduce((map, entry) => {
          if (
            !map.has(entry.data.id) ||
            (entry.data?.tab === 'react' &&
              map.has(entry.data.id) &&
              map.get(entry.data.id).data.tab === 'html')
          ) {
            map.set(entry.data.id, entry)
          }
          return map
        }, new Map())
        .values(),
    ]
  }

  const items = navItems.map((entry) => (
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
