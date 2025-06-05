import { render, screen } from '@testing-library/react'
import { NavSection } from '../NavSection'
import { type TextContentEntry } from '../NavEntry'

const mockEntriesBySection: Record<string, TextContentEntry[]> = {
  section1: [
    {
      id: 'entry1',
      data: { id: 'Complex Entry 1', section: 'section1' },
    },
    {
      id: 'entry2',
      data: { id: 'Complex Entry 2', section: 'Section1' },
    },
    {
      id: 'entry3',
      data: { id: 'Complex Entry 3', section: 'Section1' },
    },
  ],
  patternflyComponents: [
    {
      id: 'pf1',
      data: { id: 'PatternFly Button', section: 'PatternFly Components' },
    },
    {
      id: 'pf2',
      data: { id: 'PatternFly Card', section: 'PatternFly Components' },
    },
  ],
}

it('renders without crashing', () => {
  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )
  expect(screen.getByRole('button', { name: 'Section1' })).toBeInTheDocument()
})

it('collapses if the sectionId is not in the pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/foo',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  const button = screen.getByRole('button', { name: 'Section1' })
  expect(button.getAttribute('aria-expanded')).toBe('false')
})

it('expands if the kebab-cased sectionId is in the pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/foo/section1',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  const button = screen.getByRole('button', { name: 'Section1' })
  expect(button.getAttribute('aria-expanded')).toBe('true')
})

it('properly handles PatternFly section expansion based on URL', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/patternfly-components',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.patternflyComponents}
      sectionId="PatternFly Components"
      activeItem=""
    />,
  )

  const button = screen.getByRole('button', { name: 'PatternFly components' })
  expect(button.getAttribute('aria-expanded')).toBe('true')
})

it('renders the correct number of entries', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  const items = screen.getAllByRole('link')
  expect(items).toHaveLength(3)
})

it('renders all passed entries', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  expect(
    screen.getByRole('link', { name: 'Complex Entry 1' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Complex Entry 2' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'Complex Entry 3' }),
  ).toBeInTheDocument()
})

it('properly renders PatternFly entries', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/patternfly-components',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.patternflyComponents}
      sectionId="PatternFly Components"
      activeItem=""
    />,
  )

  expect(
    screen.getByRole('link', { name: 'PatternFly Button' }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('link', { name: 'PatternFly Card' }),
  ).toBeInTheDocument()
})

it('properly renders the section title in sentence case', () => {
  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  expect(screen.getByRole('button', { name: 'Section1' })).toBeInTheDocument()
})

it('preserves PatternFly casing in section title', () => {
  render(
    <NavSection
      entries={mockEntriesBySection.patternflyComponents}
      sectionId="PatternFly Components"
      activeItem=""
    />,
  )

  expect(screen.getByRole('button', { name: 'PatternFly components' })).toBeInTheDocument()
})

it('marks entry as active when activeItem matches entry id', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )

  expect(screen.getByRole('link', { name: 'Complex Entry 1' })).toHaveClass(
    'pf-m-current',
  )
})

it('marks entry as active when pathname includes kebab-cased entry id', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1/complex-entry-2',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem=""
    />,
  )

  expect(screen.getByRole('link', { name: 'Complex Entry 2' })).toHaveClass(
    'pf-m-current',
  )
})

it('marks PatternFly entry as active when pathname matches kebab-case', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/patternfly-components/patternfly-button',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.patternflyComponents}
      sectionId="PatternFly Components"
      activeItem=""
    />,
  )

  expect(screen.getByRole('link', { name: 'PatternFly Button' })).toHaveClass(
    'pf-m-current',
  )
})

it('does not mark any entries as active if none match activeItem or pathname', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1',
    },
    writable: true,
  })

  render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem=""
    />,
  )

  const links = screen.getAllByRole('link')
  links.forEach((link) => {
    expect(link).not.toHaveClass('pf-m-current')
  })
})

it('matches snapshot', () => {
  Object.defineProperty(window, 'location', {
    value: {
      pathname: '/section1',
    },
    writable: true,
  })

  const { asFragment } = render(
    <NavSection
      entries={mockEntriesBySection.section1}
      sectionId="section1"
      activeItem="entry1"
    />,
  )
  expect(asFragment()).toMatchSnapshot()
})
