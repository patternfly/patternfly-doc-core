import { render, screen, within } from '@testing-library/react'
import { PropsTable, type ComponentProp } from '../PropsTable'
import textStyles from '@patternfly/react-styles/css/utilities/Text/text'

const componentName = 'TestComponent'
const componentDescription =
  'This is the testable component for the PropsTable.'
const propWithAllTableColumns: ComponentProp = {
  name: 'propWithAllTableColumns',
  type: 'string | () => void',
  defaultValue: 'foobarbaz',
  description: 'This prop has data for all table fields.',
}
const propWithNameOnly: ComponentProp = {
  name: 'propWithNameOnly',
}

it('Renders component name in a heading level 3 by default', () => {
  render(<PropsTable componentName={componentName} />)

  expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
    componentName,
  )
})

it('Renders component name in heading level when headingLevel is passed in', () => {
  render(<PropsTable headingLevel="h2" componentName={componentName} />)

  expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
    componentName,
  )
})

it('Does not render component description by default', () => {
  render(<PropsTable componentName={componentName} />)

  expect(screen.queryByTestId('component-description')).not.toBeInTheDocument()
})

it('Renders component description when componentDescription is passed in', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentDescription={componentDescription}
    />,
  )

  expect(screen.getByText(componentDescription)).toBeVisible()
})

it('Does not render props table if componentProps is not passed in', () => {
  render(<PropsTable componentName={componentName} />)

  expect(screen.queryByRole('grid')).not.toBeInTheDocument()
})

it('Does not render props table if componentProps is empty array', () => {
  render(<PropsTable componentName={componentName} componentProps={[]} />)

  expect(screen.queryByRole('grid')).not.toBeInTheDocument()
})

it('Does not render props table if componentProps contains only hidden props', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[{ isHidden: true, ...propWithAllTableColumns }]}
    />,
  )

  expect(screen.queryByRole('grid')).not.toBeInTheDocument()
})

it('Throws error if component prop has isBeta and isDeprecated both set to true', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[
        { isBeta: true, isDeprecated: true, ...propWithAllTableColumns },
      ]}
    />,
  )

  expect(consoleSpy).toHaveBeenCalledTimes(1)
  expect(consoleSpy).toHaveBeenCalledWith(
    'The following TestComponent props have both the isBeta and isDeprecated tag: propWithAllTableColumns',
  )
  consoleSpy.mockRestore()
})

it('Does not throw error if only one of isBeta or isDeprecated is passed', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[{ isBeta: true, ...propWithAllTableColumns }]}
    />,
  )

  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

it('Does not throw error if isBeta and isDeprecated both are not passed', () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

it('Renders props table with aria-label based on componentName', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  expect(screen.getByRole('grid')).toHaveAccessibleName(
    `Props for ${componentName}`,
  )
})

it('Renders props table with aria-description referencing required prop text', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  expect(screen.getByRole('grid')).toHaveAccessibleDescription(
    `* indicates a required prop`,
  )
})

it('Renders prop row with passed in componentProp data', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const propDataCells = within(tbody).getAllByRole('cell')

  expect(propDataCells[0]).toHaveTextContent(propWithAllTableColumns.name)
  expect(propDataCells[1]).toHaveTextContent(
    propWithAllTableColumns.type as string,
  )
  expect(propDataCells[2]).toHaveTextContent(
    propWithAllTableColumns.defaultValue as string,
  )
  expect(propDataCells[3]).toHaveTextContent(
    propWithAllTableColumns.description as string,
  )
})

it('Does not render prop as required by default', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const nameCell = within(tbody).getAllByRole('cell')[0]

  expect(within(nameCell).queryByText('required')).not.toBeInTheDocument()
})

it('Renders prop as required when its isRequired property is true', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[{ isRequired: true, ...propWithAllTableColumns }]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const nameCell = within(tbody).getAllByRole('cell')[0]

  expect(nameCell).toHaveTextContent(`${propWithAllTableColumns.name}*`)
  expect(within(nameCell).getByText('required')).toBeInTheDocument()
})

it('Does not render prop as beta or deprecated by default', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const nameCell = within(tbody).getAllByRole('cell')[0]

  expect(within(nameCell).queryByText(/beta/i)).not.toBeInTheDocument()
  expect(within(nameCell).queryByText(/deprecated/i)).not.toBeInTheDocument()
})

it('Renders prop as beta when its isBeta property is true', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[{ isBeta: true, ...propWithAllTableColumns }]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const nameCell = within(tbody).getAllByRole('cell')[0]

  expect(within(nameCell).getByText(/beta/i)).toBeInTheDocument()
})

it('Renders prop as deprecated when its isDeprecated property is true', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[{ isDeprecated: true, ...propWithAllTableColumns }]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const nameCell = within(tbody).getAllByRole('cell')[0]

  expect(within(nameCell).getByText(/deprecated/i)).toBeInTheDocument()
})

it('Renders default content when type data is undefined', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithNameOnly]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const typeCell = within(tbody).getAllByRole('cell')[1]

  expect(typeCell).toHaveTextContent('No type info available')
})

it('Renders default content when defaultValue data is undefined', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithNameOnly]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const defaultValueCell = within(tbody).getAllByRole('cell')[2]

  expect(defaultValueCell).toHaveTextContent('-')
})

it('Renders default content when description data is undefined', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithNameOnly]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const descriptionCell = within(tbody).getAllByRole('cell')[3]

  expect(descriptionCell).toHaveTextContent('No description available.')
})

it('Only renders rows for props that do not have their isHidden property set to true', () => {
  render(
    <PropsTable
      componentName={componentName}
      componentProps={[
        { isHidden: true, ...propWithAllTableColumns },
        propWithNameOnly,
      ]}
    />,
  )

  const tbody = screen.getAllByRole('rowgroup')[1]
  const rows = within(tbody).getAllByRole('row')

  expect(rows).toHaveLength(1)
  Object.values(propWithAllTableColumns).forEach((value) => {
    expect(rows[0]).not.toHaveTextContent(value as string)
  })
})

it('Matches snapshot', () => {
  const { asFragment } = render(
    <PropsTable
      componentName={componentName}
      componentProps={[propWithAllTableColumns, propWithNameOnly]}
    />,
  )

  expect(asFragment()).toMatchSnapshot()
})
