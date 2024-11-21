import React from "react";
import {
  Brand,
  Masthead as PFMasthead,
  MastheadMain,
  MastheadToggle,
  PageToggleButton,
  MastheadBrand,
  MastheadLogo,
  MastheadContent,
} from "@patternfly/react-core";
import BarsIcon from "@patternfly/react-icons/dist/esm/icons/bars-icon";
import pfLogo from "@patternfly/react-core/src/demos/assets/PF-HorizontalLogo-Color.svg";
import { Toolbar } from "./Toolbar";

export const Masthead: React.FunctionComponent = () => (
  <PFMasthead>
    <MastheadMain>
      <MastheadToggle>
        <PageToggleButton variant="plain" aria-label="Global navigation">
          <BarsIcon />
        </PageToggleButton>
      </MastheadToggle>
      <MastheadBrand>
        <MastheadLogo>
          <Brand
            src={pfLogo as unknown as string}
            alt="PatternFly"
            heights={{ default: "36px" }}
          />
        </MastheadLogo>
      </MastheadBrand>
    </MastheadMain>
    <MastheadContent>
      <Toolbar />
    </MastheadContent>
  </PFMasthead>
);

export default Masthead;
