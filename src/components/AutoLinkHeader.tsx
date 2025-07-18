import { Flex, FlexItem, Content } from '@patternfly/react-core'
import LinkIcon from '@patternfly/react-icons/dist/esm/icons/link-icon'
import { slugger } from '../utils/slugger'
import { css } from '@patternfly/react-styles'

interface AutoLinkHeaderProps extends React.HTMLProps<HTMLDivElement> {
  id?: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
  metaText?: React.ReactNode
  className?: string
}

export const AutoLinkHeader = ({
  id,
  headingLevel,
  children,
  metaText,
  className,
}: AutoLinkHeaderProps) => {
  const slug = id || slugger(children)

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem>
        <Content
          id={slug}
          component={headingLevel}
          className={css('ws-heading', className)}
          tabIndex={-1}
          isEditorial
        >
          <a href={`#${slug}`} className="ws-heading-anchor" tabIndex={-1}>
            <LinkIcon
              className="ws-heading-anchor-icon"
              style={{ verticalAlign: 'middle' }}
            />
          </a>
          {children}
        </Content>
      </FlexItem>
      {metaText && <FlexItem>{metaText}</FlexItem>}
    </Flex>
  )
}
