import type React from "react";
import { PageToggleButton } from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import { useStore } from "@nanostores/react";
import { isNavOpen } from "../stores/navStore";
import { useEffect } from "react";

export const PageToggle: React.FunctionComponent = () => {
  const $isNavOpen = useStore(isNavOpen);

  /** Applies sidebar styles to the island element astro creates as a wrapper for the sidebar.
   * Without it the page content will not expand to fill the space left by the sidebar when it is collapsed.
   */
  function applySidebarStylesToIsland() {
    const isClientSide = typeof window !== "undefined";
    const sideBarIsland =
      document.getElementById("page-sidebar")?.parentElement;

    if (!isClientSide || !sideBarIsland) {
      return;
    }

    if (!sideBarIsland.classList.contains("pf-v6-c-page__sidebar")) {
      sideBarIsland.classList.add("pf-v6-c-page__sidebar", "pf-m-expanded");
    } else {
      sideBarIsland.classList.toggle("pf-m-expanded");
      sideBarIsland.classList.toggle("pf-m-collapsed");
    }
  }

  function onToggle() {
    isNavOpen.set(!$isNavOpen);
  }

  useEffect(() => {
    applySidebarStylesToIsland();
  }, [$isNavOpen]);

  return (
    <PageToggleButton
      variant="plain"
      aria-label="Global navigation"
      onSidebarToggle={onToggle}
    >
      <BarsIcon />
    </PageToggleButton>
  );
};
