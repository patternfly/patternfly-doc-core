import { useEffect, useState } from 'react'
import { Nav, NavList, PageSidebarBody } from '@patternfly/react-core'
import { NavSection } from './NavSection'
import { type TextContentEntry } from './NavEntry'

interface NavigationProps {
  navData: Record<string, TextContentEntry[]>
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
