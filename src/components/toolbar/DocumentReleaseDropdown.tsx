import React from 'react'
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  DropdownGroup,
  DropdownItem,
  Divider,
} from '@patternfly/react-core'
import { Release } from '../../types'
import versions from '../../versions.json'

export const DocumentReleaseDropdown: React.FunctionComponent = () => {
  const latestRelease = versions.Releases.find(
    (release) => release.latest,
  ) as Release
  const previousReleases = Object.values(versions.Releases).filter(
    (release) => !release.hidden && !release.latest,
  ) as Release []

  const previousVersions = Object.values(versions.ArchivedReleases) as Release[];

  const [isDropdownOpen, setDropdownOpen] = React.useState(false)

  const getDropdownItem = (version: Release, isLatest = false) => (
    <DropdownItem
      itemId={`${version.name}-latest-release`}
      key={`${version.name}-latest`}
      to={isLatest ? '/' : version.href ? version.href : `/${version.name}`}
      isExternalLink = {version.href ? true : false}
    >
      {`Release ${version.name}`}
    </DropdownItem>
  )
  return (
    <Dropdown
      onSelect={() => setDropdownOpen(!isDropdownOpen)}
      onOpenChange={(isOpen) => setDropdownOpen(isOpen)}
      isOpen={isDropdownOpen}
      toggle={(toggleRef) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setDropdownOpen(!isDropdownOpen)}
          isExpanded={isDropdownOpen}
        >
          {`Release ${latestRelease.name}`}
        </MenuToggle>
      )}
      popperProps={{ position: 'right' }}
    >
      <DropdownGroup key="Latest" label="Latest">
        <DropdownList>{getDropdownItem(latestRelease, true)}</DropdownList>
      </DropdownGroup>
      {previousReleases.length > 0 && (
        <DropdownGroup key="Previous releases" label="Previous releases">
          <DropdownList>
            {previousReleases
              .slice(0, 3)
              .map((version) => getDropdownItem(version))}
          </DropdownList>
        </DropdownGroup>
      )}
      {previousVersions.length > 0 && ( 
      <><Divider key="divider1" /><DropdownGroup key="Previous versions" label="Previous versions">
          <DropdownList>
            {previousVersions.map((version) => getDropdownItem(version))}
          </DropdownList>
        </DropdownGroup></>)}
    </Dropdown>
  )
}
