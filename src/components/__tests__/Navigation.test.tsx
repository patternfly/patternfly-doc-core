import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../Navigation'
import { TextContentEntry } from '../NavEntry'

const mockEntries: Record<string, TextContentEntry[]> = {
  'section one': [
    {
      id: 'entry1',
      data: { id: 'Entry1', section: 'section-one' },
    },
    {
      id: 'entry2',
      data: { id: 'Entry2', section: 'section-one' },
    },
    {
      id: 'entry3',
      data: { id: 'Entry3', section: 'section-one' },
    },
    {
      id: 'entry4',
      data: { id: 'Entry4', section: 'section-one' },
    },
    {
      id: 'entry5',
      data: { id: 'Entry5', section: 'section-one' },
    },
  ],
  'section two': [
    {
      id: 'entry6',
      data: { id: 'Entry6', section: 'section-two' },
    },
    {
      id: 'entry7',
      data: { id: 'Entry7', section: 'section-two' },
    },
    {
      id: 'entry8',
      data: { id: 'Entry8', section: 'section-two' },
    },
  ],
}

it('renders without crashing', () => {
  render(<Navigation navData={mockEntries} />)
  expect(screen.getByText('Section one')).toBeInTheDocument()
  expect(screen.getByText('Section two')).toBeInTheDocument()
})

it('renders the correct number of sections', () => {
  render(<Navigation navData={mockEntries} />)
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})

it('sets the active item based on the current pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section-one/entry1',
    },
    writable: true,
  })

  render(<Navigation navData={mockEntries} />)

  const entryLink = screen.getByRole('link', { name: 'Entry1' })

  expect(entryLink).toHaveClass('pf-m-current')
})

it('updates the active item on selection', async () => {
  // prevent errors when trying to navigate from logging in the console and cluttering the test output
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const user = userEvent.setup()

  render(<Navigation navData={mockEntries} />)

  const sectionTwo = screen.getByRole('button', { name: 'Section two' })

  await user.click(sectionTwo)

  const entryLink = screen.getByRole('link', { name: 'Entry6' })

  await user.click(entryLink)

  expect(entryLink).toHaveClass('pf-m-current')
})

it('matches snapshot', () => {
  const { asFragment } = render(<Navigation navData={mockEntries} />)
  expect(asFragment()).toMatchSnapshot()
})
