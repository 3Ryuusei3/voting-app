import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Word } from '../types'

interface VotingCardProps {
  word: Word
  onVote: (wordId: number, difficult: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
}

const VotingCard = ({ word, onVote, isLoading }: VotingCardProps) => {
  const [localLoading, setLocalLoading] = useState(false)

  const handleVote = async (difficult: 'easy' | 'difficult' | 'not_exist') => {
    if (isLoading || localLoading) return

    setLocalLoading(true)
    try {
      await onVote(word.id, difficult)
    } catch (error) {
      console.error('Error al votar:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-body text-center">
        <h2 className="text-2xl font-bold mb-6">
          <Link to={`https://dle.rae.es/${word.word}`} target="_blank">{word.word.toUpperCase()}</Link>
        </h2>

        {(isLoading || localLoading) ? (
          <div className="flex justify-center gap-sm">
            <button className="btn btn-primary w-100" disabled style={{ minHeight: '190px' }}>CARGANDO...</button>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            <div className="flex flex-col justify-center gap-sm">
              <button
                className="btn btn-lg btn-tertiary w-100"
                onClick={() => handleVote('not_exist')}
                disabled={isLoading || localLoading}
              >
                NO EXISTE
              </button>
              <button
                className="btn btn-lg btn-error w-100"
                onClick={() => handleVote('difficult')}
                disabled={isLoading || localLoading}
              >
                DIFÍCIL
              </button>
              <button
                className="btn btn-lg btn-success w-100"
                onClick={() => handleVote('easy')}
                disabled={isLoading || localLoading}
              >
                FÁCIL
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VotingCard
