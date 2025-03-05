import { useEffect, useState } from 'react'
import { Nav, NavList, PageSidebarBody } from '@patternfly/react-core'
import { NavSection } from './NavSection'
import { type TextContentEntry } from './NavEntry'

interface NavigationProps {
  navEntries: TextContentEntry[]
}

export const Navigation: React.FunctionComponent<NavigationProps> = ({
  navEntries,
}: NavigationProps) => {
  const [activeItem, setActiveItem] = useState('')

  useEffect(() => {
    setActiveItem(window.location.pathname.split('/').reverse()[0])
  }, [])

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: { itemId: string | number },
  ) => {
    setActiveItem(selectedItem.itemId.toString())
  }

  const sections = new Set(navEntries.map((entry) => entry.data.section))

  const navSections = Array.from(sections).map((section) => {
    const entries = navEntries.filter((entry) => entry.data.section === section)

    return (
      <NavSection
        key={section}
        entries={entries}
        sectionId={section}
        activeItem={activeItem}
      />
    )
  })

  return (
    // Can possibly add back PageSidebar wrapper when https://github.com/patternfly/patternfly/issues/7377 goes in
    <PageSidebarBody id="page-sidebar-body">
      <Nav onSelect={onNavSelect}>
        <NavList>{navSections}</NavList>
      </Nav>
    </PageSidebarBody>
  )
}
