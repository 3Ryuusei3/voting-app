import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { VoteHistory, Option } from '../types'
import undoIcon from '../assets/undo-icon.svg'
import { useVotingKeyboardShortcuts } from '../hooks/useVotingKeyboardShortcuts'
interface VotingCardProps {
  option: Option
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
  voteHistory?: VoteHistory[]
  previousVotes?: VoteHistory[]
  handleUndo: () => Promise<void>
  pollUrl: string | null
}

const VotingCard = ({ option, onVote, onUpdateVote, isLoading, voteHistory, previousVotes, handleUndo, pollUrl }: VotingCardProps) => {
  const [localLoading, setLocalLoading] = useState(false)

  const handleVote = async (filter: 'easy' | 'difficult' | 'not_exist') => {
    if (isLoading || localLoading) return

    setLocalLoading(true)
    try {
      // Check if this option was previously voted
      const hasPreviousVote = voteHistory?.some(vote => vote.id === option.id)

      if (hasPreviousVote) {
        // If it was previously voted, update the vote
        await onUpdateVote(option.id, filter)
      } else {
        // If it wasn't previously voted, create a new vote
        await onVote(option.id, filter)
      }
    } catch (error) {
      console.error('Error al votar:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const checkPreviousVote = (filter: 'easy' | 'difficult' | 'not_exist') => {
    const inPreviousVotes = previousVotes?.some(vote => vote.id === option.id && vote.filter === filter)
    return inPreviousVotes
  }

  const showUndoButton = !!(voteHistory && voteHistory.length > 0 && voteHistory[0].id !== option.id)

  useVotingKeyboardShortcuts({
    option,
    isLoading,
    localLoading,
    handleVote,
    handleUndo,
    showUndoButton,
    pollUrl
  })

  return (
    <div className="card card__voting">
      {showUndoButton && (
        <div className="undo-btn mb-6 max-w-md mx-auto">
          <button
            className="relative"
            onClick={handleUndo}
            disabled={isLoading}
          >
            <img src={undoIcon} alt="Undo" width={26} height={26} />
          </button>
        </div>
      )}
      <div className="card-body gap-md text-center">
        <h2 className="text-xl font-bold mb-6 rel">
          <Link
            to={pollUrl ? `${pollUrl}${option.option}` : ``}
            target="_blank"
            rel="noopener noreferrer"
            className='rel'
          >
            {option.option.toUpperCase()}
            {pollUrl && (
              <span className="desktop-help-key title">
                A
              </span>
            )}
          </Link>
        </h2>
        <p className="text-muted">Indica si conoces la opción mostrada. Puedes pulsar sobre el título para encontrar más información.</p>
        <div className="flex flex-col gap-xs">
          <div className="button-group flex flex-col justify-center gap-xs">
            <div className="flex flex-col gap-xs">
              <button
                className={`btn btn-lg btn-tertiary w-100 ${checkPreviousVote('not_exist') ? 'prev-vote' : ''} flex align-center gap-sm rel`}
                onClick={() => handleVote('not_exist')}
                disabled={isLoading || localLoading}
              >
                <span>ELIMINAR</span>
                <span>🗑️</span>
                <span className="desktop-help-key">
                  3
                </span>
              </button>
              <button
                className={`btn btn-lg btn-error w-100 ${checkPreviousVote('difficult') ? 'prev-vote' : ''} flex align-center gap-sm rel`}
                onClick={() => handleVote('difficult')}
                disabled={isLoading || localLoading}
              >
                <span>DIFÍCIL</span>
                <span>😥</span>
                <span className="desktop-help-key">
                  2
                </span>
              </button>
              <button
                className={`btn btn-lg btn-success w-100 ${checkPreviousVote('easy') ? 'prev-vote' : ''} flex align-center gap-sm rel`}
                onClick={() => handleVote('easy')}
                disabled={isLoading || localLoading}
              >
                <span>FÁCIL</span>
                <span>☕️</span>
                <span className="desktop-help-key">
                  1
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingCard
