import { useEffect, useState } from 'react'
import { Nav, NavList, PageSidebarBody } from '@patternfly/react-core'
import { NavSection } from './NavSection'
import { type TextContentEntry } from './NavEntry'

export interface NavData {
  section: string
  navEntries: TextContentEntry[]
}
interface NavigationProps {
  navData: NavData[]
}

export const Navigation: React.FunctionComponent<NavigationProps> = ({
  navData,
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

  return (
    // Can possibly add back PageSidebar wrapper when https://github.com/patternfly/patternfly/issues/7377 goes in
    <PageSidebarBody id="page-sidebar-body">
      <Nav onSelect={onNavSelect}>
        <NavList>
          {navData.map(({ section, navEntries }) => (
            <NavSection
              key={section}
              entries={navEntries}
              sectionId={section}
              activeItem={activeItem}
            />
          ))}
        </NavList>
      </Nav>
    </PageSidebarBody>
  )
}
