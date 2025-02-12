// DocumentReleaseDropdown.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentReleaseDropdown } from '../DocumentReleaseDropdown';

jest.mock('../../../versions.json', () => ({
  Releases: [
    { name: '1.0.0', latest: true, hidden: false, href: '' },
    { name: '1.1.0', latest: false, hidden: false, href: '/1.1.0' },
    { name: '1.2.0', latest: false, hidden: false, href: '/1.2.0' },
    { name: '1.2.0', latest: false, hidden: true, href: '/1.2.1' },
  ],
  ArchivedReleases: [
    { name: '0.9.0', latest: false, hidden: false, href: '' },
    { name: '0.8.0', latest: false, hidden: false, href: '' },
  ]
}));

describe('DocumentReleaseDropdown', () => {

  it('renders the dropdown with the latest release', () => {
    render(<DocumentReleaseDropdown />);

    // Check if the latest release is rendered
    expect(screen.getByText('Release 1.0.0')).toBeInTheDocument();
  });

  it('opens and closes the dropdown when clicked', () => {
    render(<DocumentReleaseDropdown />);

    const toggleButton = screen.getByText('Release 1.0.0');

    expect(screen.queryByText('Release 1.1.0')).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText('Release 1.1.0')).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByText('Release 1.1.0')).not.toBeInTheDocument();
  });

  it('displays the previous releases', () => {
    render(<DocumentReleaseDropdown />);

    fireEvent.click(screen.getByText('Release 1.0.0'));

    expect(screen.getByText('Release 1.1.0')).toBeInTheDocument();
    expect(screen.getByText('Release 1.2.0')).toBeInTheDocument();
  });

  it('displays the archived versions', () => {
    render(<DocumentReleaseDropdown />);

    fireEvent.click(screen.getByText('Release 1.0.0'));

    expect(screen.getByText('Release 0.9.0')).toBeInTheDocument();
    expect(screen.getByText('Release 0.8.0')).toBeInTheDocument();
  });

  it('has the correct links for each release', () => {
    render(<DocumentReleaseDropdown />);

    fireEvent.click(screen.getByText('Release 1.0.0'));

    const release2Link = screen.getByText('Release 1.1.0').closest('a');
    expect(release2Link).toHaveAttribute('href', '/1.1.0');

    const archivedLink = screen.getByText('Release 0.9.0').closest('a');
    expect(archivedLink).toHaveAttribute('href', '/0.9.0');
  });

  it('does not display hidden releases', () => {

    render(<DocumentReleaseDropdown />);

    fireEvent.click(screen.getByText('Release 1.0.0'));

    expect(screen.queryByText('Release 1.2.1')).not.toBeInTheDocument();
  });
});
