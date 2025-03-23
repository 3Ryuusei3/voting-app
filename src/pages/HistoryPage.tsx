import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useHistoryData } from '../hooks/useHistoryData'
import { HistoryCard } from '../components/HistoryCard'
import { Pagination } from '../components/Pagination'

const HistoryPage = () => {
  const { isCheckingUser } = useAuth()
  const [searchParams] = useSearchParams()
  const pollId = Number(searchParams.get('pollId'))

  const [state, actions] = useHistoryData(pollId)

  // Show loading state while checking authentication
  if (isCheckingUser) {
    return (
      <div className="container">
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  if (state.isInitialLoading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Cargando listado...</p>
        </div>
      </div>
    )
  }

  // Calculate showClearButton
  const showClearButton = state.searchInput.length > 0 || state.filterSelection !== 'all'

  return (
    <div className="container">
      <div className="flex flex-col gap-2xs justify-center align-center w-100">
        <HistoryCard
          votes={state.votes}
          unvotedOptions={state.unvotedOptions}
          showUnvoted={state.showUnvoted}
          isLoading={state.isLoading}
          error={state.error}
          pollId={pollId}
          pollUrl={state.pollUrl}
          totalVotes={state.totalVotes}
          optionCounts={state.optionCounts}
          searchQuery={state.searchQuery}
          searchInput={state.searchInput}
          filterSelection={state.filterSelection}
          showFilters={state.showFilters}
          showClearButton={showClearButton}
          onUpdateVote={actions.handleUpdateVote}
          onVote={actions.handleVote}
          onToggleUnvoted={actions.setShowUnvoted}
          onSearchInput={actions.handleSearchInput}
          onSearch={actions.handleSearch}
          onKeyPress={actions.handleKeyPress}
          onFilterChange={actions.handleDifficultyFilter}
          onClearFilters={actions.handleClearFilters}
          onToggleFilters={actions.handleShowFilters}
          getDifficultyText={actions.getDifficultyText}
          getCompletionPercentage={actions.getCompletionPercentage}
        />

        {state.totalVotes > 0 && (
          <Pagination
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            onPageChange={actions.setCurrentPage}
            isLoading={state.isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default HistoryPage
