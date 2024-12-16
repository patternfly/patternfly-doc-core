import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../Navigation'
import { TextContentEntry } from '../NavEntry'

const mockEntries: TextContentEntry[] = [
  {
    id: 'entry1',
    data: { id: 'Entry1', section: 'section1' },
    collection: 'textContent',
  },
  {
    id: 'entry2',
    data: { id: 'Entry2', section: 'section1' },
    collection: 'textContent',
  },
  {
    id: 'entry3',
    data: { id: 'Entry3', section: 'section2' },
    collection: 'textContent',
  },
]

it('renders without crashing', () => {
  render(<Navigation navEntries={mockEntries} />)
  expect(screen.getByText('Section1')).toBeInTheDocument()
  expect(screen.getByText('Section2')).toBeInTheDocument()
})

it('renders the correct number of sections', () => {
  render(<Navigation navEntries={mockEntries} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('sets the active item based on the current pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1/entry1',
    },
    writable: true,
  })

  render(<Navigation navEntries={mockEntries} />)

  const entryLink = screen.getByRole('link', { name: 'Entry1' })

  expect(entryLink).toHaveClass('pf-m-current')
})

it('updates the active item on selection', async () => {
  const user = userEvent.setup()

  render(<Navigation navEntries={mockEntries} />)

  const entryLink = screen.getByRole('link', { name: 'Entry2' })

  await user.click(entryLink)

  expect(entryLink).toHaveClass('pf-m-current')
})

it('matches snapshot', () => {
  const { asFragment } = render(<Navigation navEntries={mockEntries} />)
  expect(asFragment()).toMatchSnapshot()
})
