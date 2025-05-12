import { useEffect, useState } from 'react'
import { Nav, NavList, PageSidebarBody } from '@patternfly/react-core'
import { NavSection } from './NavSection'
import { type TextContentEntry } from './NavEntry'

interface NavigationProps {
  navEntries?: TextContentEntry[]
  navData: Record<string, TextContentEntry[]>
  navSectionOrder?: string[]
}

export const Navigation: React.FunctionComponent<NavigationProps> = ({
  navEntries,
  navData,
  navSectionOrder,
}: NavigationProps) => {
  const [activeItem, setActiveItem] = useState('')

  useEffect(() => {
    // TODO: Needs an alternate solution because of /tab in the path
    setActiveItem(window.location.pathname.split('/').reverse()[0])
  }, [])

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: { itemId: string | number },
  ) => {
    setActiveItem(selectedItem.itemId.toString())
  }

  // const uniqueSections = Array.from(
  //   new Set(navEntries.map((entry) => entry.data.section)),
  // )

  // We want to list any ordered sections first, followed by any unordered sections sorted alphabetically
  // TODO update with new navData logic
  // const [orderedSections, unorderedSections] = Object.entries(navData).reduce(
  //   (acc, section) => {
  //     if (!navSectionOrder) {
  //       acc[1].push(section)
  //       return acc
  //     }

  //     const index = navSectionOrder.indexOf(section)
  //     if (index > -1) {
  //       acc[0][index] = section
  //     } else {
  //       acc[1].push(section)
  //     }
  //     return acc
  //   },
  //   [[], []] as [string[], string[]],
  // )
  // const sortedSections = [...orderedSections, ...unorderedSections.sort()]

  // const navSections = sortedSections.map((section) => {
  //   const entries = navEntries.filter((entry) => entry.data.section === section)

  //   return (
  //     <NavSection
  //       key={section}
  //       entries={entries}
  //       sectionId={section}
  //       activeItem={activeItem}
  //     />
  //   )
  // })

  return (
    // Can possibly add back PageSidebar wrapper when https://github.com/patternfly/patternfly/issues/7377 goes in
    <PageSidebarBody id="page-sidebar-body">
      <Nav onSelect={onNavSelect}>
        <NavList>
          {Object.entries(navData).map(([key, value], index) => (
            <NavSection
              key={index}
              entries={value}
              sectionId={key}
              activeItem={activeItem}
            />
          ))}
        </NavList>
      </Nav>
    </PageSidebarBody>
  )
}
