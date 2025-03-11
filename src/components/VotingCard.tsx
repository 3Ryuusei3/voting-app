import { useState } from 'react'
import type { Word } from '../types'

interface VotingCardProps {
  word: Word
  onVote: (wordId: number, difficult: boolean) => Promise<void>
  isLoading: boolean
}

const VotingCard = ({ word, onVote, isLoading }: VotingCardProps) => {
  const [localLoading, setLocalLoading] = useState(false)

  const handleVote = async (difficult: boolean) => {
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
        <h2 className="text-2xl font-bold mb-6">{word.word.toUpperCase()}</h2>
        <p className="text-muted mb-6">¿Crees que esta palabra es difícil para el juego?</p>

        {(isLoading || localLoading) ? (
          <div className="flex justify-center gap-sm">
            <button className="btn btn-primary w-100" disabled>CARGANDO...</button>
          </div>
        ) : (
          <div className="flex justify-center gap-sm">
            <button
              className="btn btn-error w-100"
              onClick={() => handleVote(true)}
              disabled={isLoading || localLoading}
            >
              DIFÍCIL
            </button>
            <button
              className="btn btn-success w-100"
              onClick={() => handleVote(false)}
              disabled={isLoading || localLoading}
            >
              FÁCIL
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VotingCard
