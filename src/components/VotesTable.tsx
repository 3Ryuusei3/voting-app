import { Link } from 'react-router-dom'
import type { Vote, Word } from '../types'

interface VoteWithWord extends Vote {
  word: Word
}

interface VotesTableProps {
  votes: VoteWithWord[]
  isLoading: boolean
  onUpdateVote: (wordId: number, difficulty: 'easy' | 'difficult' | 'not_exist') => void
  getDifficultyText: (difficulty: string) => string
}

export const VotesTable = ({
  votes,
  isLoading,
  onUpdateVote,
  getDifficultyText
}: VotesTableProps) => {
  return (
    <table className="w-100">
      <thead>
        <tr className="border-b border-clr-border">
          <th className="text-left p-xs text-muted text-small w-100">Palabra</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Fecha</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {votes.map((vote) => (
          <tr key={vote.id} className="border-b border-clr-border">
            <td className="p-2xs">
              <h3 className="text-xl font-bold mb-6">
                {vote.word ? (
                  <Link
                    to={`https://dle.rae.es/${vote.word.word}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {vote.word.word.toUpperCase()}
                  </Link>
                ) : (
                  <span className="text-muted">Palabra no encontrada</span>
                )}
              </h3>
            </td>
            <td className="p-xs text-extra-small">
              {new Date(vote.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }) + 'H ' + new Date(vote.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).split('/').join('/')}
            </td>
            <td className="p-xs">
              <div className="flex gap-2xs">
                <button
                  className={`btn btn-xs btn-success ${getDifficultyText(vote.difficult) === 'Fácil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.word_id, 'easy')}
                  disabled={isLoading}
                >
                  <strong>F</strong>
                </button>
                <button
                  className={`btn btn-xs btn-error ${getDifficultyText(vote.difficult) === 'Difícil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.word_id, 'difficult')}
                  disabled={isLoading}
                >
                  <strong>D</strong>
                </button>
                <button
                  className={`btn btn-xs btn-tertiary ${getDifficultyText(vote.difficult) === 'No existe' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.word_id, 'not_exist')}
                  disabled={isLoading}
                >
                  <strong>N</strong>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
