
import { render, screen } from '@testing-library/react';
import { NavEntry, TextContentEntry } from '../NavEntry';

const mockEntry: TextContentEntry = {
  id: 'entry1',
  data: { id: 'Entry1', section: 'section1' },
  collection: 'textContent',
};

describe('NavEntry', () => {
  it('renders without crashing', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />);
    expect(screen.getByText('Entry1')).toBeInTheDocument();
  });

  it('renders the correct link', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/section1/entry1');
  });

  it('marks the entry as active if isActive is true', () => {
    render(<NavEntry entry={mockEntry} isActive={true} />);
    expect(screen.getByRole('link')).toHaveClass('pf-m-current');
  });

  it('does not mark the entry as active if isActive is false', () => {
    render(<NavEntry entry={mockEntry} isActive={false} />);
    expect(screen.getByRole('link')).not.toHaveClass('pf-m-current');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<NavEntry entry={mockEntry} isActive={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});