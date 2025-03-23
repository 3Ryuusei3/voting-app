import type { DifficultyFilter } from '../types'

interface HistoryStatsProps {
  totalVotes: number
  totalOptions: number
  showUnvoted: boolean
  filterSelection: DifficultyFilter
  completionPercentage: string | number
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
}

export const HistoryStats = ({
  totalVotes,
  totalOptions,
  showUnvoted,
  filterSelection,
  completionPercentage,
  getDifficultyText
}: HistoryStatsProps) => {
  if (totalVotes <= 0 || totalOptions <= 0) return null

  return (
    <div className="text-center text-small text-muted mt-2">
      <span>
        <strong>{totalVotes}</strong>
        {showUnvoted
          ? ' sin votar'
          : filterSelection === 'all'
            ? ' votadas'
            : ` votadas - ${getDifficultyText(filterSelection as 'easy' | 'difficult' | 'not_exist')}`
        }
        {' '}
        <span className="ml-2">
          <strong>({completionPercentage}%)</strong>
        </span>
      </span>
    </div>
  )
}
