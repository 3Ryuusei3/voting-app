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

  return (
    <div className="card card__voting">
      {voteHistory && voteHistory.length > 0 && (
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
      <div className="card-body text-center">
        <h2 className="text-2xl font-bold mb-6">
          <Link to={`https://dle.rae.es/${word.word}`} target="_blank">{word.word.toUpperCase()}</Link>
        </h2>
        <p className="text-muted">Indica la dificultad de la palabra. Puedes pulsar sobre la palabra para ver su significado en el diccionario.</p>
        <div className="flex flex-col gap-xs">
          <button
            className={`btn btn-lg btn-tertiary w-100 ${checkPreviousVote('not_exist') ? 'prev-vote' : ''}`}
            onClick={() => handleVote('not_exist')}
            disabled={isLoading || localLoading}
          >
            NO EXISTE
          </button>
          <div className="button-group flex flex-col justify-center gap-xs">
            <div className="flex flex-col gap-sm">
              <button
                className={`btn btn-lg btn-error w-100 ${checkPreviousVote('difficult') ? 'prev-vote' : ''}`}
                onClick={() => handleVote('difficult')}
                disabled={isLoading || localLoading}
              >
                DIFÍCIL
              </button>
              <button
                className={`btn btn-lg btn-success w-100 ${checkPreviousVote('easy') ? 'prev-vote' : ''}`}
                onClick={() => handleVote('easy')}
                disabled={isLoading || localLoading}
              >
                FÁCIL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingCard
