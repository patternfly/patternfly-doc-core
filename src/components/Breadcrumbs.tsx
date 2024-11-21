import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import type React from "react";

export const Breadcrumbs: React.FunctionComponent = () => (
  <Breadcrumb>
    <BreadcrumbItem>Section home</BreadcrumbItem>
    <BreadcrumbItem to="#">Section title</BreadcrumbItem>
    <BreadcrumbItem to="#">Section title</BreadcrumbItem>
    <BreadcrumbItem to="#" isActive>
      Section landing
    </BreadcrumbItem>
  </Breadcrumb>
);
