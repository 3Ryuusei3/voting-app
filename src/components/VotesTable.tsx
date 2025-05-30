import { Link } from 'react-router-dom'
import type { Vote, Option } from '../types'

interface VoteWithOption extends Vote {
  option: Option
}

interface VotesTableProps {
  votes: VoteWithOption[]
  isLoading: boolean
  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
  pollUrl: string | null
}

export const VotesTable = ({
  votes,
  isLoading,
  onUpdateVote,
  getDifficultyText,
  pollUrl
}: VotesTableProps) => {
  return (
    <table className="w-100">
      <thead>
        <tr className="border-b border-clr-border">
          <th className="text-left p-xs text-muted text-small w-100">Palabra</th>
          <th className="text-left time-cell text-muted text-small whitespace-nowrap w-fit">Fecha</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {votes.map((vote) => (
          <tr key={vote.id}>
            <td className="p-3xs">
              <h4 className="text-xl font-bold option-title">
                {vote.option ? (
                  <Link
                    to={pollUrl ? `${pollUrl}${vote.option.option}` : ``}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {vote.option.option.toUpperCase()}
                  </Link>
                ) : (
                  <span className="text-muted">Palabra no encontrada</span>
                )}
              </h4>
            </td>
            <td className="time-cell text-extra-small">
              {new Date(vote.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }) + 'H ' + new Date(vote.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              }).split('/').join('/')}
            </td>
            <td className="p-3xs">
              <div className="flex gap-2xs">
                <button
                  className={`btn btn-rg btn-success ${getDifficultyText(vote.filter) === 'Fácil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.option_id, 'easy')}
                  disabled={isLoading}
                >
                  <strong>F</strong>
                </button>
                <button
                  className={`btn btn-rg btn-error ${getDifficultyText(vote.filter) === 'Difícil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.option_id, 'difficult')}
                  disabled={isLoading}
                >
                  <strong>D</strong>
                </button>
                <button
                  className={`btn btn-rg btn-tertiary ${getDifficultyText(vote.filter) === 'Eliminadas' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(vote.option_id, 'not_exist')}
                  disabled={isLoading}
                >
                  <strong>E</strong>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
