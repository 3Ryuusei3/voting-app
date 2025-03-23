import React from 'react'
import { HistoryTabs } from './HistoryTabs'
import { HistoryFilters } from './HistoryFilters'
import { HistoryContent } from './HistoryContent'
import { HistoryStats } from './HistoryStats'
import type { DifficultyFilter, Vote, Option } from '../types'

interface VoteWithOption extends Vote {
  option: Option
}

interface HistoryCardProps {
  votes: VoteWithOption[]
  unvotedOptions: Option[]
  showUnvoted: boolean
  isLoading: boolean
  error: string | null
  pollId: number
  pollUrl: string | null
  totalVotes: number
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
  searchQuery: string
  searchInput: string
  filterSelection: DifficultyFilter
  showFilters: boolean
  showClearButton: boolean

  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  onToggleUnvoted: (show: boolean) => void
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onFilterChange: (filter: DifficultyFilter) => void
  onClearFilters: () => void
  onToggleFilters: () => void
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
  getCompletionPercentage: () => string | number
}

export const HistoryCard = ({
  votes,
  unvotedOptions,
  showUnvoted,
  isLoading,
  error,
  pollId,
  pollUrl,
  totalVotes,
  optionCounts,
  searchQuery,
  searchInput,
  filterSelection,
  showFilters,
  showClearButton,
  onUpdateVote,
  onVote,
  onToggleUnvoted,
  onSearchInput,
  onSearch,
  onKeyPress,
  onFilterChange,
  onClearFilters,
  onToggleFilters,
  getDifficultyText,
  getCompletionPercentage
}: HistoryCardProps) => {
  return (
    <div className="card card__history mb-xs">
      <div className="card-body gap-sm">
        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <HistoryFilters
          showFilters={showFilters}
          searchInput={searchInput}
          onSearchInput={onSearchInput}
          onSearch={onSearch}
          onKeyPress={onKeyPress}
          isLoading={isLoading}
          filterSelection={filterSelection}
          onFilterChange={onFilterChange}
          showUnvoted={showUnvoted}
          onClearFilters={onClearFilters}
          showClearButton={showClearButton}
        />

        <HistoryTabs
          showUnvoted={showUnvoted}
          isLoading={isLoading}
          showFilters={showFilters}
          onToggleUnvoted={onToggleUnvoted}
          onToggleFilters={onToggleFilters}
        />

        <div>
          <HistoryContent
            showUnvoted={showUnvoted}
            votes={votes}
            unvotedOptions={unvotedOptions}
            isLoading={isLoading}
            searchQuery={searchQuery}
            pollId={pollId}
            pollUrl={pollUrl}
            onUpdateVote={onUpdateVote}
            onVote={onVote}
            getDifficultyText={getDifficultyText}
          />
        </div>

        <HistoryStats
          totalVotes={totalVotes}
          totalOptions={optionCounts.total}
          showUnvoted={showUnvoted}
          filterSelection={filterSelection}
          completionPercentage={getCompletionPercentage()}
          getDifficultyText={getDifficultyText}
        />
      </div>
    </div>
  )
}
