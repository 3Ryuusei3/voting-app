import type { DifficultyFilter } from '../types'

interface DifficultyFiltersProps {
  currentFilter: DifficultyFilter
  onFilterChange: (filter: DifficultyFilter) => void
  isLoading: boolean
}

export const DifficultyFilters = ({
  currentFilter,
  onFilterChange,
  isLoading
}: DifficultyFiltersProps) => {
  return (
    <>
      <button
        className={`btn btn-xs btn-primary ${currentFilter === 'all' ? 'prev-vote' : ''}`}
        onClick={() => onFilterChange('all')}
        disabled={isLoading}
      >
        <strong>T</strong>
      </button>
      <button
        className={`btn btn-xs btn-success ${currentFilter === 'easy' ? 'prev-vote' : ''}`}
        onClick={() => onFilterChange('easy')}
        disabled={isLoading}
      >
        <strong>F</strong>
      </button>
      <button
        className={`btn btn-xs btn-error ${currentFilter === 'difficult' ? 'prev-vote' : ''}`}
        onClick={() => onFilterChange('difficult')}
        disabled={isLoading}
      >
        <strong>D</strong>
      </button>
      <button
        className={`btn btn-xs btn-tertiary ${currentFilter === 'not_exist' ? 'prev-vote' : ''}`}
        onClick={() => onFilterChange('not_exist')}
        disabled={isLoading}
      >
        <strong>N</strong>
      </button>
    </>
  )
}
