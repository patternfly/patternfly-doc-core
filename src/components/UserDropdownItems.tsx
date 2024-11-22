import { DropdownItem } from "@patternfly/react-core";

export const UserDropdownItems: React.FunctionComponent = () => (
  <>
    <DropdownItem key="group 2 profile">My profile</DropdownItem>
    <DropdownItem key="group 2 user">User management</DropdownItem>
    <DropdownItem key="group 2 logout">Logout</DropdownItem>
  </>
);
