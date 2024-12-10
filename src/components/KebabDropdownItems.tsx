import React from 'react'
import { DropdownItem } from '@patternfly/react-core'
import CogIcon from '@patternfly/react-icons/dist/esm/icons/cog-icon'
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon'

export const KebabDropdownItems: React.FunctionComponent = () => (
  <>
    <DropdownItem>
      <CogIcon /> Settings
    </DropdownItem>
    <DropdownItem>
      <HelpIcon /> Help
    </DropdownItem>
  </>
)
