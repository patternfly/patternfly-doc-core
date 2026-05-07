import { NavExpandable } from '@patternfly/react-core'
import { sentenceCase, kebabCase } from '../utils/case'
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
  const isExpanded = window.location.pathname.includes(kebabCase(sectionId))
  const isActive = entries.some((entry) => entry.id === activeItem)

  // Group entries by subsection
  const topLevelEntries = entries.filter((entry) => !entry.data.subsection)
  const subsections = new Map<string, TextContentEntry[]>()
  entries.forEach((entry) => {
    if (entry.data.subsection) {
      const sub = entry.data.subsection
      if (!subsections.has(sub)) {
        subsections.set(sub, [])
      }
      subsections.get(sub)!.push(entry)
    }
  })

  const renderEntry = (entry: TextContentEntry) => (
    <NavEntry
      key={entry.id}
      entry={entry}
      isActive={
        activeItem === entry.id ||
        window.location.pathname.includes(kebabCase(entry.data.id))
      }
    />
  )

  return (
    <NavExpandable
      title={sentenceCase(sectionId)}
      isActive={isActive}
      isExpanded={isExpanded}
      id={`nav-section-${sectionId}`}
    >
      {topLevelEntries.map(renderEntry)}
      {Array.from(subsections.entries()).map(([subsection, subEntries]) => {
        const subIsExpanded = subEntries.some(
          (entry) => activeItem === entry.id || window.location.pathname.includes(kebabCase(entry.data.id))
        )
        return (
          <NavExpandable
            key={subsection}
            title={sentenceCase(subsection)}
            isActive={subIsExpanded}
            isExpanded={subIsExpanded || isExpanded}
            id={`nav-subsection-${sectionId}-${subsection}`}
          >
            {subEntries.map(renderEntry)}
          </NavExpandable>
        )
      })}
    </NavExpandable>
  )
}
