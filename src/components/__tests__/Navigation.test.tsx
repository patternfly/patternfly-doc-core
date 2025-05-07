import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../Navigation'
import { TextContentEntry } from '../NavEntry'

const mockEntries: TextContentEntry[] = [
  {
    id: 'entry1',
    data: { id: 'Entry1', section: 'section-one' },
    collection: 'textContent',
  },
  {
    id: 'entry2',
    data: { id: 'Entry2', section: 'section-two' },
    collection: 'textContent',
  },
  {
    id: 'entry3',
    data: { id: 'Entry3', section: 'section-two' },
    collection: 'textContent',
  },
  {
    id: 'entry4',
    data: { id: 'Entry4', section: 'section-three' },
    collection: 'textContent',
  },
  {
    id: 'entry5',
    data: { id: 'Entry5', section: 'section-four' },
    collection: 'textContent',
  },
]

it('renders without crashing', () => {
  render(<Navigation navEntries={mockEntries} />)
  expect(screen.getByText('Section one')).toBeInTheDocument()
  expect(screen.getByText('Section two')).toBeInTheDocument()
})

it('renders the correct number of sections', () => {
  render(<Navigation navEntries={mockEntries} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(4)
})

it('sets the active item based on the current pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section-one/entry1',
    },
    writable: true,
  })

  render(<Navigation navEntries={mockEntries} />)

  const entryLink = screen.getByRole('link', { name: 'Entry1' })

  expect(entryLink).toHaveClass('pf-m-current')
})

it('updates the active item on selection', async () => {
  // prevent errors when trying to navigate from logging in the console and cluttering the test output
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const user = userEvent.setup()

  render(<Navigation navEntries={mockEntries} />)

  const sectionTwo = screen.getByRole('button', { name: 'Section two' })

  await user.click(sectionTwo)

  const entryLink = screen.getByRole('link', { name: 'Entry2' })

  await user.click(entryLink)

  expect(entryLink).toHaveClass('pf-m-current')
})

it('sorts all sections alphabetically by default', () => {
  render(<Navigation navEntries={mockEntries} />)

  const sections = screen.getAllByRole('button')

  expect(sections[0]).toHaveTextContent('Section four')
  expect(sections[1]).toHaveTextContent('Section one')
  expect(sections[2]).toHaveTextContent('Section three')
  expect(sections[3]).toHaveTextContent('Section two')
})

it('sorts sections based on the order provided', () => {
  render(
    <Navigation
      navEntries={mockEntries}
      navSectionOrder={['section-two', 'section-one']}
    />,
  )

  const sections = screen.getAllByRole('button')

  expect(sections[0]).toHaveTextContent('Section two')
  expect(sections[1]).toHaveTextContent('Section one')
})

it('sorts unordered sections alphabetically after ordered sections', () => {
  render(
    <Navigation navEntries={mockEntries} navSectionOrder={['section-two']} />,
  )

  const sections = screen.getAllByRole('button')

  expect(sections[2]).toHaveTextContent('Section one')
  expect(sections[3]).toHaveTextContent('Section three')
})

it('matches snapshot', () => {
  const { asFragment } = render(<Navigation navEntries={mockEntries} />)
  expect(asFragment()).toMatchSnapshot()
})
