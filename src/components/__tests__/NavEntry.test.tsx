import { render, screen } from '@testing-library/react'
import { NavEntry, TextContentEntry } from '../NavEntry'

const mockEntry: TextContentEntry = {
  id: 'entry1',
  data: { id: 'Entry 1 Title', section: 'section1' },
}

describe('NavEntry', () => {
  it('renders without crashing', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />)
    expect(screen.getByText('Entry 1 Title')).toBeInTheDocument()
  })

  it('renders the correct link with kebab-cased title', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/section1/entry-1-title',
    )
  })

  it('properly transforms PatternFly text in URLs', () => {
    const patternflyEntry: TextContentEntry = {
      id: 'pf1',
      data: { id: 'PatternFly Components', section: 'PatternFly' },
    }
    render(<NavEntry entry={patternflyEntry} isActive={false} />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/patternfly/patternfly-components',
    )
  })

  it('preserves PatternFly text in display', () => {
    const patternflyEntry: TextContentEntry = {
      id: 'pf1',
      data: { id: 'PatternFly Components', section: 'PatternFly' },
    }
    render(<NavEntry entry={patternflyEntry} isActive={false} />)
    expect(screen.getByText('PatternFly Components')).toBeInTheDocument()
  })

  it('marks the entry as active if isActive is true', () => {
    render(<NavEntry entry={mockEntry} isActive={true} />)
    expect(screen.getByRole('link')).toHaveClass('pf-m-current')
  })

  it('does not mark the entry as active if isActive is false', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />)
    expect(screen.getByRole('link')).not.toHaveClass('pf-m-current')
  })

  it('matches snapshot', () => {
    const { asFragment } = render(
      <NavEntry entry={mockEntry} isActive={false} />,
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
