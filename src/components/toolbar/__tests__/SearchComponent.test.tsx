import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SearchComponent } from '../SearchComponent'
import '@testing-library/jest-dom'

describe('SearchComponent', () => {
  it('renders when searchEnabled is true', () => {
    render(<SearchComponent />)

    waitFor(() => {
      const searchInput = screen.getByLabelText('Search input')
      expect(searchInput).toBeInTheDocument()
    })
  })

  it('does not render when searchEnabled is false', () => {
    render(<SearchComponent searchEnabled={false} />)

    const searchInput = screen.queryByPlaceholderText('Search')
    expect(searchInput).not.toBeInTheDocument()
  })

  it('updates the search value when user types', () => {
    render(<SearchComponent />)
    waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: 'test' } })

      expect(searchInput).toHaveValue('test')
    })
  })

  it('clears the search value when clear button is clicked', () => {
    render(<SearchComponent />)
    waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: 'test' } })
      fireEvent.click(screen.getByRole('button', { name: /clear/i }))

      expect(searchInput).toHaveValue('')
    })
  })

  it('toggles search expansion', () => {
    render(<SearchComponent />)

    waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search')
      const toggleButton = screen.getByLabelText(
        'Expandable search input toggle',
      )

      // Test initial state (collapsed)
      expect(searchInput).toHaveClass('pf-m-closed')

      // Simulate toggle to expand
      fireEvent.click(toggleButton)
      expect(searchInput).toHaveClass('pf-m-expanded')

      // Simulate toggle to collapse
      fireEvent.click(toggleButton)
      expect(searchInput).toHaveClass('pf-m-closed')
    })
  })
})
