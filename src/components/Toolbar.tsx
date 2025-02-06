import * as React from 'react'
import {
  Button,
  Toolbar as PFToolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core'

import { ToggleThemeSwitcher } from './toolbar/ToogleThemeSwitcher'
import { SearchComponent } from './toolbar/SearchComponent'
import { DocumentReleaseDropdown } from './toolbar/DocumentReleaseDropdown';
import GithubIcon from '@patternfly/react-icons/dist/esm/icons/github-icon';

export const Toolbar: React.FunctionComponent = () => {
  return (
    <PFToolbar id="toolbar" isStatic>
      <ToolbarContent>
        <ToolbarGroup
          variant="action-group-plain"
          align={{ default: 'alignEnd' }}
          gap={{ default: 'gapNone', md: 'gapMd' }}
        >
          <ToolbarItem>
            <ToggleThemeSwitcher/>
          </ToolbarItem>
          <ToolbarItem>
            <SearchComponent/>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              component="a"
              variant="plain"
              href="//github.com/patternfly"
              target="top"
              aria-label="PatternFly GitHub page"
            >
                <GithubIcon />
            </Button>
          </ToolbarItem>
          <ToolbarItem>
           <DocumentReleaseDropdown/>
          </ToolbarItem>
        </ToolbarGroup>
      </ToolbarContent>
    </PFToolbar>
  )
}
