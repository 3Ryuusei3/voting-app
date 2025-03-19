import { Link } from 'react-router-dom'
import type { Word } from '../types'

interface UnvotedWordsTableProps {
  words: Word[]
  isLoading: boolean
  onVote: (wordId: number, difficulty: 'easy' | 'difficult' | 'not_exist') => void
}

export const UnvotedWordsTable = ({
  words,
  isLoading,
  onVote
}: UnvotedWordsTableProps) => {
  return (
    <table className="w-100">
      <thead>
        <tr className="border-b border-clr-border">
          <th className="text-left p-xs text-muted text-small w-100">Palabra</th>
          <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {words.map((word) => (
          <tr key={word.id} className="border-b border-clr-border">
            <td className="p-2xs">
              <h3 className="text-xl font-bold mb-6">
                <Link
                  to={`https://dle.rae.es/${word.word}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {word.word.toUpperCase()}
                </Link>
              </h3>
            </td>
            <td className="p-xs">
              <div className="flex gap-2xs">
                <button
                  className="btn btn-xs btn-success"
                  onClick={() => onVote(word.id, 'easy')}
                  disabled={isLoading}
                >
                  <strong>F</strong>
                </button>
                <button
                  className="btn btn-xs btn-error"
                  onClick={() => onVote(word.id, 'difficult')}
                  disabled={isLoading}
                >
                  <strong>D</strong>
                </button>
                <button
                  className="btn btn-xs btn-tertiary"
                  onClick={() => onVote(word.id, 'not_exist')}
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
