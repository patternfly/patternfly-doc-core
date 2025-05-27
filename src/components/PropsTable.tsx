import { Label, Stack } from '@patternfly/react-core'
import {
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  TableText,
} from '@patternfly/react-table'
import { css } from '@patternfly/react-styles'
import accessibleStyles from '@patternfly/react-styles/css/utilities/Accessibility/accessibility'
import textStyles from '@patternfly/react-styles/css/utilities/Text/text'
import {Content} from '@patternfly/react-core';

export type ComponentProp = {
  name: string
  isRequired?: boolean
  isBeta?: boolean
  isHidden?: boolean
  isDeprecated?: boolean
  type?: string
  defaultValue?: string
  description?: string
}

interface PropsTableProps extends React.HTMLProps<HTMLDivElement> {
  componentName: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  componentDescription?: string
  componentProps?: ComponentProp[]
}

export const PropsTable: React.FunctionComponent<PropsTableProps> = ({
  componentName,
  headingLevel = 'h3',
  componentDescription,
  componentProps,
}) => {
  const publicProps = componentProps?.filter((prop) => !prop.isHidden)
  const hasPropsToRender = !!publicProps?.length

  const renderTagLabel = (componentProp: ComponentProp) => {
    const { name, isBeta, isDeprecated } = componentProp
    if (!isBeta && !isDeprecated) {
      return null
    }

    if (isBeta && isDeprecated) {
      // eslint-disable-next-line no-console
      console.error(
        `The ${name} prop for ${componentName} has both the isBeta and isDeprecated tag.`,
      )
    }

    return (
      <Label color={`${isBeta ? 'blue' : 'grey'}`} isCompact>
        {isBeta ? 'Beta' : 'Deprecated'}
      </Label>
    )
  }

  const renderRequiredDescription = (isRequired: boolean | undefined) => {
    if (!isRequired) {
      return null
    }

    return (
      <>
        <span aria-hidden="true" className={css(textStyles.textColorRequired)}>
          *
        </span>
        <span className={css(accessibleStyles.screenReader)}>required</span>
      </>
    )
  }

  return (
    <div>
      <Content component={headingLevel}>{componentName}</Content>
      <Stack hasGutter>
        {componentDescription && (
          <div
            data-testid="component-description"
            className={css(textStyles.textColorSubtle)}
          >
            {componentDescription}
          </div>
        )}
        {hasPropsToRender && (
          <>
            <div id={`${componentName}-required-description`}>
              <span className={css(textStyles.textColorRequired)}>*</span>{' '}
              <span className={css(textStyles.textColorSubtle)}>
                indicates a required prop
              </span>
            </div>
            <Table
              variant="compact"
              aria-label={`Props for ${componentName}`}
              aria-describedby={`${componentName}-required-description`}
              gridBreakPoint="grid-lg"
            >
              <Thead>
                <Tr>
                  <Th width={20}>Name</Th>
                  <Th width={20}>Type</Th>
                  <Th width={10}>Default</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {publicProps.map((prop: ComponentProp) => (
                  <Tr key={prop.name}>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.name}
                        {renderRequiredDescription(prop.isRequired)}{' '}
                        {renderTagLabel(prop)}
                      </TableText>
                    </Td>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.type || 'No type info available'}
                      </TableText>
                    </Td>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.defaultValue || '-'}
                      </TableText>
                    </Td>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.description || 'No description available.'}
                      </TableText>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </>
        )}
      </Stack>
    </div>
  )
}
