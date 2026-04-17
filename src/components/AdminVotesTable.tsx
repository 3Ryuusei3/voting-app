import { Link } from 'react-router-dom'
import type { AdminVoteRow } from '../lib/adminService'

interface AdminVotesTableProps {
  rows: AdminVoteRow[]
  isLoading: boolean
  onUpdateVote: (voteId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
  pollUrl: string | null
}

export const AdminVotesTable = ({
  rows,
  isLoading,
  onUpdateVote,
  getDifficultyText,
  pollUrl
}: AdminVotesTableProps) => {
  return (
    <table className="w-100">
      <thead>
        <tr className="border-b border-clr-border">
          <th className="text-left p-xs text-muted text-small w-100">Palabra / Usuario</th>
          <th className="text-left time-cell text-muted text-small whitespace-nowrap w-fit">Fecha</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.vote_id}>
            <td className="p-3xs">
              <h4 className="text-xl font-bold option-title">
                <Link
                  to={pollUrl ? `${pollUrl}${row.option_text}` : ``}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {row.option_text.toUpperCase()}
                </Link>
              </h4>
              <p className="text-muted text-extra-small">
                {row.user_name || row.user_email || row.user_id}
              </p>
            </td>
            <td className="time-cell text-extra-small">
              {new Date(row.created_at).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
              }) + 'H ' + new Date(row.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              }).split('/').join('/')}
            </td>
            <td className="p-3xs">
              <div className="flex gap-2xs">
                <button
                  className={`btn btn-rg btn-success ${getDifficultyText(row.filter) === 'Fácil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(row.vote_id, 'easy')}
                  disabled={isLoading}
                >
                  <strong>F</strong>
                </button>
                <button
                  className={`btn btn-rg btn-error ${getDifficultyText(row.filter) === 'Difícil' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(row.vote_id, 'difficult')}
                  disabled={isLoading}
                >
                  <strong>D</strong>
                </button>
                <button
                  className={`btn btn-rg btn-tertiary ${getDifficultyText(row.filter) === 'Eliminadas' ? 'prev-vote' : ''}`}
                  onClick={() => onUpdateVote(row.vote_id, 'not_exist')}
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
