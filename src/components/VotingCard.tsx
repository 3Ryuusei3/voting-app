import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { VoteHistory, Word } from '../types'
import undoIcon from '../assets/undo-icon.svg'
interface VotingCardProps {
  word: Word
  onVote: (wordId: number, difficult: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
  voteHistory?: VoteHistory[]
  onUpdateVote: (wordId: number, newDifficulty: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleUndo: () => Promise<void>
}

const VotingCard = ({ word, onVote, isLoading, voteHistory, onUpdateVote, handleUndo }: VotingCardProps) => {
  const [localLoading, setLocalLoading] = useState(false)

  const handleVote = async (difficult: 'easy' | 'difficult' | 'not_exist') => {
    if (isLoading || localLoading) return

    setLocalLoading(true)
    try {
      if (voteHistory && voteHistory.some(vote => vote.id === word.id)) {
        await onUpdateVote(word.id, difficult)
      } else {
        await onVote(word.id, difficult)
      }
    } catch (error) {
      console.error('Error al votar:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const checkPreviousVote = (difficulty: 'easy' | 'difficult' | 'not_exist') => {
    return voteHistory?.some(vote => vote.id === word.id && vote.difficulty === difficulty)
  }

  const showUndoButton = voteHistory && voteHistory.length > 0 && voteHistory[0].id !== word.id

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
        <h2 className="text-2xl font-bold mb-6">
          <Link to={`https://dle.rae.es/${word.word}`} target="_blank">{word.word.toUpperCase()}</Link>
        </h2>
        <p className="text-muted">Indica la dificultad de la palabra. Puedes pulsar sobre la palabra para ver su significado en el diccionario.</p>
        <div className="flex flex-col gap-xs">
          <div className="button-group flex flex-col justify-center gap-xs">
            <div className="flex flex-col gap-xs">
              <button
                className={`btn btn-lg btn-tertiary w-100 ${checkPreviousVote('not_exist') ? 'prev-vote' : ''} flex align-center gap-sm`}
                onClick={() => handleVote('not_exist')}
                disabled={isLoading || localLoading}
              >
                <span>NO EXISTE</span>
                <span>🤷‍♂️</span>
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
