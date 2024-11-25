import { useState } from "react";
import {
  Nav,
  NavList,
  NavItem,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { useStore } from "@nanostores/react";
import { isNavOpen } from "../stores/navStore";

interface NavOnSelectProps {
  groupId: number | string;
  itemId: number | string;
  to: string;
}

export const Navigation: React.FunctionComponent = () => {
  const [activeItem, setActiveItem] = useState(1);

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: NavOnSelectProps
  ) => {
    typeof selectedItem.itemId === "number" &&
      setActiveItem(selectedItem.itemId);
  };

  const $isNavOpen = useStore(isNavOpen);

  return (
    <PageSidebar isSidebarOpen={$isNavOpen}>
      <PageSidebarBody>
        <Nav onSelect={onNavSelect}>
          <NavList>
            <NavItem itemId={0} isActive={activeItem === 0} to="test">
              Test
            </NavItem>
            <NavItem itemId={1} isActive={activeItem === 1} to="#policy">
              Policy
            </NavItem>
            <NavItem itemId={2} isActive={activeItem === 2} to="#auth">
              Authentication
            </NavItem>
            <NavItem itemId={3} isActive={activeItem === 3} to="#network">
              Network services
            </NavItem>
            <NavItem itemId={4} isActive={activeItem === 4} to="#server">
              Server
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
};
