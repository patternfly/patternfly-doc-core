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

type PropsTableProps = {
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
  const SectionHeading = headingLevel
  const publicProps = componentProps?.filter((prop) => !prop.isHidden)
  const hasPropsToRender = !!publicProps?.length
  const betaDeprecatedProps = hasPropsToRender
    ? publicProps.filter((prop) => prop.isBeta && prop.isDeprecated)
    : []

  if (betaDeprecatedProps.length) {
    console.error(
      `The following ${componentName} props have both the isBeta and isDeprecated tag: ${betaDeprecatedProps.map((prop) => prop.name).join(', ')}`,
    )
  }

  const renderTagLabel = (componentProp: ComponentProp) => {
    const { isBeta, isDeprecated } = componentProp
    if (!isBeta && !isDeprecated) {
      return null
    }

    return (
      <Label
        // Would need design eyes on outline vs filled
        variant="outline"
        color={`${isBeta ? 'blue' : 'orange'}`}
        isCompact
      >
        {isBeta ? 'Beta' : 'Deprecated'}
      </Label>
    )
  }

  return (
    <>
      <SectionHeading>{componentName}</SectionHeading>
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
                        {prop.isRequired ? (
                          <>
                            <span
                              aria-hidden="true"
                              className={css(textStyles.textColorRequired)}
                            >
                              *
                            </span>
                            <span
                              className={css(accessibleStyles.screenReader)}
                            >
                              required
                            </span>
                          </>
                        ) : (
                          ''
                        )}{' '}
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
    </>
  )
}
