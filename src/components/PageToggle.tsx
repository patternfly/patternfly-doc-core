import type React from "react";
import { PageToggleButton } from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import { useStore } from "@nanostores/react";
import { isNavOpen } from "../stores/navStore";

export const PageToggle: React.FunctionComponent = () => {
  const $isNavOpen = useStore(isNavOpen);

  function onToggle() {
    isNavOpen.set(!$isNavOpen);
  }

  return (
    <PageToggleButton variant="plain" aria-label="Global navigation" onSidebarToggle={onToggle}>
      <BarsIcon />
    </PageToggleButton>
  );
};
