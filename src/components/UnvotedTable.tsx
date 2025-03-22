import { Link } from 'react-router-dom'
import type { Option } from '../types'

interface UnvotedTableProps {
  options: Option[]
  isLoading: boolean
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  pollUrl: string | null
}

export const UnvotedTable = ({
  options,
  isLoading,
  onVote,
  pollUrl
}: UnvotedTableProps) => {
  if (!options || options.length === 0) {
    return null
  }

  return (
    <table className="w-100">
      <thead>
        <tr className="border-b border-clr-border">
          <th className="text-left p-xs text-muted text-small w-100">Palabra</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {options.map((option) => (
          <tr key={option.id} className="border-b border-clr-border">
            <td className="p-3xs">
              <h4 className="text-xl font-bold option-title">
                <Link
                  to={pollUrl ? `${pollUrl}${option.option}` : ``}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {option.option.toUpperCase()}
                </Link>
              </h4>
            </td>
            <td className="p-3xs">
              <div className="flex gap-2xs">
                <button
                  className="btn btn-rg btn-success"
                  onClick={() => onVote(option.id, 'easy')}
                  disabled={isLoading}
                >
                  <strong>F</strong>
                </button>
                <button
                  className="btn btn-rg btn-error"
                  onClick={() => onVote(option.id, 'difficult')}
                  disabled={isLoading}
                >
                  <strong>D</strong>
                </button>
                <button
                  className="btn btn-rg btn-tertiary"
                  onClick={() => onVote(option.id, 'not_exist')}
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
