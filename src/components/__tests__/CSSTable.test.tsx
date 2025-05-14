import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CSSTable } from '../CSSTable'

jest.mock('@patternfly/react-tokens/dist/esm/componentIndex', () => ({
  test: {
    '.test-selector': {
      '--test-property': {
        name: 'test-property',
        value: 'test-value',
      },
      '--another-property': {
        name: 'another-property',
        value: '#123456',
      },
    },
    '.another-selector': {
      '--list-property': {
        name: 'list-property',
        value: 'list-item-1',
        values: ['list-item-1', 'list-item-2'],
      },
    },
  },
  'pf-v6-empty': {},
}))

describe('<CSSTable />', () => {
  it('renders without crashing', () => {
    render(<CSSTable cssPrefix="pf-v6-test" />)
    expect(
      screen.getByRole('grid', {
        name: /CSS Variables prefixed with pf-v6-test/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the correct table headers when hideSelectorColumn is false (default)', () => {
    render(<CSSTable cssPrefix="pf-v6-test" />)
    expect(screen.getByText('Selector')).toBeInTheDocument()
    expect(screen.getByText('Variable')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders the correct table headers when hideSelectorColumn is true', () => {
    render(<CSSTable cssPrefix="pf-v6-test" hideSelectorColumn />)
    expect(screen.queryByText('Selector')).not.toBeInTheDocument()
    expect(screen.getByText('Variable')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('renders the correct data rows', () => {
    render(<CSSTable cssPrefix="pf-v6-test" />)
    expect(
      screen.getByRole('row', {
        name: '.test-selector test-property test-value',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('row', {
        name: '.test-selector another-property (In light theme) #123456',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('row', {
        name: 'Details .another-selector list-property list-item-1',
      }),
    ).toBeInTheDocument()
  })

  it('renders the "Prefixed with" header when autoLinkHeader is true', () => {
    render(<CSSTable cssPrefix="pf-v6-test" autoLinkHeader />)
    expect(
      screen.getByRole('heading', {
        name: /Prefixed with 'pf-v6-test'/i,
        level: 3,
      }),
    ).toBeInTheDocument()
  })

  it('does not render the "Prefixed with" header when autoLinkHeader is false (default)', () => {
    render(<CSSTable cssPrefix="pf-v6-test" />)
    expect(
      screen.queryByRole('heading', {
        name: /Prefixed with 'pf-v6-test'/i,
        level: 3,
      }),
    ).not.toBeInTheDocument()
  })

  it('filters rows based on search input', async () => {
    render(<CSSTable cssPrefix="pf-v6-test" debounceLength={0} />)
    const searchInput = screen.getByPlaceholderText('Filter CSS Variables')

    expect(
      screen.getByRole('row', {
        name: '.test-selector test-property test-value',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('row', {
        name: 'Details .another-selector list-property list-item-1',
      }),
    ).toBeInTheDocument()
    fireEvent.change(searchInput, { target: { value: 'test' } })
    await waitFor(() => {
      // row doesn't seem to work here for whatever reason
      expect(screen.getAllByText('.test-selector')).toHaveLength(2)
      expect(screen.getByText('test-property')).toBeInTheDocument()
      expect(screen.queryByText('.another-selector')).not.toBeInTheDocument()
      expect(screen.queryByText('list-property')).not.toBeInTheDocument()
    })

    fireEvent.change(searchInput, { target: { value: 'list' } })
    await waitFor(() => {
      expect(screen.queryByText('.test-selector')).not.toBeInTheDocument()
      expect(screen.queryByText('test-property')).not.toBeInTheDocument()
      expect(screen.getByText('.another-selector')).toBeInTheDocument()
      expect(screen.getAllByText('list-property')).toHaveLength(2)
    })
  })

  it('handles the case where the cssPrefix does not exist in tokensModule', () => {
    render(<CSSTable cssPrefix="pf-v6-nonexistent" />)
    expect(screen.queryByRole('grid')).toBeInTheDocument() // Table should still render, but be empty
    expect(screen.queryByText('.test-selector')).not.toBeInTheDocument()
  })

  it('renders correctly when hideSelectorColumn is true and there are rows', () => {
    render(<CSSTable cssPrefix="pf-v6-test" hideSelectorColumn />)
    expect(screen.queryByText('.test-selector')).not.toBeInTheDocument()
    expect(
      screen.getByRole('row', {
        name: 'test-property',
      }),
    ).toBeInTheDocument()
  })
})
