import { useState, type ReactNode } from "react";
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

interface NavEntry {
  id: string;
  data: {
    title: string;
  };
  collection: string;
}

interface NavigationProps {
  navEntries: NavEntry[];
}

export const Navigation: React.FunctionComponent<NavigationProps> = ({
  navEntries,
}: NavigationProps) => {
  const [activeItem, setActiveItem] = useState("");

  const onNavSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: NavOnSelectProps
  ) => {
    typeof selectedItem.itemId === "string" &&
      setActiveItem(selectedItem.itemId);
  };

  const $isNavOpen = useStore(isNavOpen);

  const sortedNavEntries = navEntries.sort((a, b) =>
    a.data.title.localeCompare(b.data.title)
  );

  const navItems = sortedNavEntries.map((entry) => (
    <NavItem
      key={entry.id}
      itemId={entry.id}
      isActive={activeItem === entry.id}
      to={`/${entry.collection}/${entry.id}`}
    >
      {entry.data.title}
    </NavItem>
  ));

  return (
    <PageSidebar isSidebarOpen={$isNavOpen}>
      <PageSidebarBody>
        <Nav onSelect={onNavSelect}>
          <NavList>{navItems}</NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );
};
