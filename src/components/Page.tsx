import {
  Content,
  Page as PFPage,
  PageSection,
  SkipToContent,
} from "@patternfly/react-core";
import { Breadcrumbs } from "./Breadcrumbs";
import { Masthead } from "./Masthead";
import { Navigation } from "./Navigation";

interface PageProps extends React.HTMLProps<HTMLDivElement> {
  title: string;
  mainContainerId: string;
}

export const Page: React.FunctionComponent<PageProps> = ({
  title,
  mainContainerId,
  children,
}: PageProps) => (
  <PFPage
    masthead={<Masthead />}
    sidebar={<Navigation />}
    isManagedSidebar
    skipToContent={
      <SkipToContent href={`#${mainContainerId}`}>
        Skip to content
      </SkipToContent>
    }
    breadcrumb={<Breadcrumbs />}
    mainContainerId={mainContainerId}
    isBreadcrumbWidthLimited
    isBreadcrumbGrouped
    additionalGroupedContent={
      <PageSection isWidthLimited>
        <Content>
          <h1>{title}</h1>
        </Content>
      </PageSection>
    }
    groupProps={{
      stickyOnBreakpoint: { default: "top" },
    }}
  >
    <PageSection>{children}</PageSection>
  </PFPage>
);
