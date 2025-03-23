import React from 'react'
import { SearchBar } from './SearchBar'
import { DifficultyFilters } from './DifficultyFilters'
import type { DifficultyFilter } from '../types'

interface HistoryFiltersProps {
  showFilters: boolean
  searchInput: string
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  filterSelection: DifficultyFilter
  onFilterChange: (filter: DifficultyFilter) => void
  showUnvoted: boolean
  onClearFilters: () => void
  showClearButton: boolean
}

export const HistoryFilters = ({
  showFilters,
  searchInput,
  onSearchInput,
  onSearch,
  onKeyPress,
  isLoading,
  filterSelection,
  onFilterChange,
  showUnvoted,
  onClearFilters,
  showClearButton
}: HistoryFiltersProps) => {
  return (
    <div className={`filter-section ${showFilters ? '' : 'hidden'} flex gap-xs justify-center align-center bp-sm`}>
      <SearchBar
        searchInput={searchInput}
        onSearchInput={onSearchInput}
        onSearch={onSearch}
        onKeyPress={onKeyPress}
        isLoading={isLoading}
        isSearchDisabled={false}
        placeholder="Buscar palabras..."
        onClearFilters={onClearFilters}
        showClearButton={showClearButton}
      />
      <div className="flex gap-2xs">
        {!showUnvoted && (
          <DifficultyFilters
            currentFilter={filterSelection}
            onFilterChange={onFilterChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}
