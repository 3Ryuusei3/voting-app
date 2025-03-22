import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { VoteHistory, Option } from '../types'
import undoIcon from '../assets/undo-icon.svg'
interface VotingCardProps {
  option: Option
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
  voteHistory?: VoteHistory[]
  onUpdateVote: (optionId: number, newFilter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleUndo: () => Promise<void>
  pollUrl: string | null
}

const VotingCard = ({ option, onVote, isLoading, voteHistory, onUpdateVote, handleUndo, pollUrl }: VotingCardProps) => {
  const [localLoading, setLocalLoading] = useState(false)

  const handleVote = async (filter: 'easy' | 'difficult' | 'not_exist') => {
    if (isLoading || localLoading) return

    setLocalLoading(true)
    try {
      if (voteHistory && voteHistory.some(vote => vote.id === option.id)) {
        await onUpdateVote(option.id, filter)
      } else {
        await onVote(option.id, filter)
      }
    } catch (error) {
      console.error('Error al votar:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const checkPreviousVote = (filter: 'easy' | 'difficult' | 'not_exist') => {
    return voteHistory?.some(vote => vote.id === option.id && vote.filter === filter)
  }

  const showUndoButton = voteHistory && voteHistory.length > 0 && voteHistory[0].id !== option.id

  return (
    <div className="card card__voting">
      {showUndoButton && (
        <div className="undo-btn mb-6 max-w-md mx-auto">
          <button
            className=""
            onClick={handleUndo}
            disabled={isLoading}
          >
            <img src={undoIcon} alt="Undo" width={26} height={26} />
          </button>
        </div>
      )}
      <div className="card-body gap-md text-center">
        <h2 className="text-xl font-bold mb-6">
          <Link
            to={pollUrl ? `${pollUrl}${option.option}` : ``}
            target="_blank"
            rel="noopener noreferrer"
          >
            {option.option.toUpperCase()}
          </Link>
        </h2>
        <p className="text-muted">Indica si conoces la opción mostrada. Puedes pulsar sobre el título para encontrar más información.</p>
        <div className="flex flex-col gap-xs">
          <div className="button-group flex flex-col justify-center gap-xs">
            <div className="flex flex-col gap-xs">
              <button
                className={`btn btn-lg btn-tertiary w-100 ${checkPreviousVote('not_exist') ? 'prev-vote' : ''} flex align-center gap-sm`}
                onClick={() => handleVote('not_exist')}
                disabled={isLoading || localLoading}
              >
                <span>ELIMINAR</span>
                <span>🗑️</span>
              </button>
              <button
                className={`btn btn-lg btn-error w-100 ${checkPreviousVote('difficult') ? 'prev-vote' : ''} flex align-center gap-sm`}
                onClick={() => handleVote('difficult')}
                disabled={isLoading || localLoading}
              >
                <span>DIFÍCIL</span>
                <span>😥</span>
              </button>
              <button
                className={`btn btn-lg btn-success w-100 ${checkPreviousVote('easy') ? 'prev-vote' : ''} flex align-center gap-sm`}
                onClick={() => handleVote('easy')}
                disabled={isLoading || localLoading}
              >
                <span>FÁCIL</span>
                <span>☕️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingCard
