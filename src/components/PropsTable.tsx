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

type ComponentProp = {
  name: string
  isRequired?: boolean
  isBeta?: boolean
  isDeprecated?: boolean
  type?: string
  defaultValue?: string
  description: string
}

type PropsTableProps = {
  componentName: string
  componentDescription?: string
  componentProps?: ComponentProp[]
}

export const PropsTable: React.FunctionComponent<PropsTableProps> = ({
  componentName,
  componentDescription,
  componentProps,
}) => {
  const hasPropsToRender = !!componentProps?.length
  const betaDeprecatedProps = hasPropsToRender
    ? componentProps.filter((prop) => prop.isBeta && prop.isDeprecated)
    : []

  if (betaDeprecatedProps.length) {
    throw new Error(
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
      <h3>{componentName}</h3>
      <Stack hasGutter>
        {componentDescription && (
          <div className={css(textStyles.textColorSubtle)}>
            {componentDescription}
          </div>
        )}
        {hasPropsToRender && (
          <>
            <div id={`${componentName}-required`}>
              <span className={css(textStyles.textColorRequired)}>*</span>{' '}
              <span className={css(textStyles.textColorSubtle)}>
                indicates a required prop
              </span>
            </div>
            <Table
              variant="compact"
              aria-label={`Props for ${componentName}`}
              aria-describedby={`${componentName}-required`}
              gridBreakPoint="grid-lg"
            >
              <Thead>
                <Tr>
                  <Th width={20}>Name</Th>
                  <Th width={20}>Type</Th>
                  <Th>Default</Th>
                  <Th>Description</Th>
                </Tr>
              </Thead>
              <Tbody>
                {componentProps?.map((prop: ComponentProp) => (
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
                        {prop.type || 'No type info'}
                      </TableText>
                    </Td>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.defaultValue}
                      </TableText>
                    </Td>
                    <Td>
                      <TableText wrapModifier="breakWord">
                        {prop.description}
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
