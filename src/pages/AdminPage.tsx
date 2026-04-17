import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAdminVoteSearch } from '../hooks/useAdminVoteSearch'
import { AdminSearchCard } from '../components/AdminSearchCard'

const AdminPage = () => {
  const { isCheckingUser, isAuthenticated, userRole } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pollId = Number(searchParams.get('pollId'))

  const [state, actions] = useAdminVoteSearch(pollId)

  useEffect(() => {
    if (isCheckingUser) return
    if (!isAuthenticated || !pollId) {
      navigate('/')
      return
    }
    if (userRole !== null && userRole !== 1) {
      navigate('/')
    }
  }, [isCheckingUser, isAuthenticated, userRole, pollId, navigate])

  if (isCheckingUser || userRole === null) {
    return (
      <div className="container">
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 1) {
    return null
  }

  return (
    <div className="container">
      <div className="flex flex-col gap-2xs justify-center align-center w-100">
        <AdminSearchCard
          rows={state.rows}
          isLoading={state.isLoading}
          error={state.error}
          searchInput={state.searchInput}
          searchQuery={state.searchQuery}
          hasSearched={state.hasSearched}
          exactWordMatch={state.exactWordMatch}
          pollUrl={state.pollUrl}
          onSearchInput={actions.handleSearchInput}
          onSearch={actions.handleSearch}
          onKeyPress={actions.handleKeyPress}
          onClear={actions.handleClear}
          onToggleExactWordMatch={actions.handleToggleExactWordMatch}
          onUpdateVote={actions.handleUpdateVote}
          getDifficultyText={actions.getDifficultyText}
        />
      </div>
    </div>
  )
}

export default AdminPage
