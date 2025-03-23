import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useVoteData } from '../hooks/useVoteData'
import { VoteContainer } from '../components/VoteContainer'
import { CompletedView } from '../components/CompletedView'
import { LoadingView } from '../components/LoadingView'
import { ErrorNotice } from '../components/ErrorNotice'

const VotePage = () => {
  const { isCheckingUser } = useAuth()
  const [searchParams] = useSearchParams()
  const pollId = Number(searchParams.get('pollId'))

  const [state, actions] = useVoteData(pollId)

  // Show loading state while checking authentication
  if (isCheckingUser) {
    return (
      <div className="container">
        <LoadingView message="Verificando autenticación..." />
      </div>
    )
  }

  // Si no hay palabras para votar
  if (state.options.length === 0 && !state.isLoading && state.dataLoaded) {
    return <CompletedView optionCounts={state.optionCounts} />
  }

  return (
    <div className="container">
      <ErrorNotice message={state.error || ""} />

      {state.options.length > 0 && (
        <VoteContainer
          option={state.options[state.currentOptionIndex]}
          onVote={actions.handleVote}
          isLoading={state.isLoading}
          voteHistory={state.voteHistory}
          onUpdateVote={actions.handleUpdateVote}
          handleUndo={actions.handleUndo}
          pollUrl={state.pollUrl}
          optionCounts={state.optionCounts}
        />
      )}

      {state.isLoading && state.options.length === 0 && (
        <LoadingView />
      )}
    </div>
  )
}

export default VotePage
