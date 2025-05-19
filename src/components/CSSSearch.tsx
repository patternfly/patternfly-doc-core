import { useState } from 'react'
import { SearchInput } from '@patternfly/react-core'

interface CSSSearchProps {
  getDebouncedFilteredRows: (value: string) => void
  'aria-label'?: string
  placeholder?: string
}

export const CSSSearch: React.FC<CSSSearchProps> = ({
  getDebouncedFilteredRows,
  'aria-label': ariaLabel = 'Filter CSS Variables',
  placeholder = 'Filter CSS Variables',
}: CSSSearchProps) => {
  const [filterValue, setFilterValue] = useState('')

  const onFilterChange = (
    _event: React.FormEvent<HTMLInputElement>,
    value: string,
  ) => {
    setFilterValue(value)
    getDebouncedFilteredRows(value)
  }

  return (
    <SearchInput
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={filterValue}
      onChange={onFilterChange}
    />
  )
}
