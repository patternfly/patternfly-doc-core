import { useState } from 'react'
import { SearchInput } from '@patternfly/react-core'

interface CSSSearchProps {
  getDebouncedFilteredRows: (value: string) => void
}

export const CSSSearch: React.FC<CSSSearchProps> = ({
  getDebouncedFilteredRows,
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
      aria-label="Filter CSS Variables"
      placeholder="Filter CSS Variables"
      value={filterValue}
      onChange={onFilterChange}
    />
  )
}
