import React from 'react'
import { useNavigate } from 'react-router-dom'
import { VotesTable } from './VotesTable'
import { UnvotedTable } from './UnvotedTable'
import type { Vote, Option } from '../types'

interface VoteWithOption extends Vote {
  option: Option
}

interface HistoryContentProps {
  showUnvoted: boolean
  votes: VoteWithOption[]
  unvotedOptions: Option[]
  isLoading: boolean
  searchQuery: string
  pollId: number
  pollUrl: string | null
  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
}

export const HistoryContent: React.FC<HistoryContentProps> = ({
  showUnvoted,
  votes,
  unvotedOptions,
  isLoading,
  searchQuery,
  pollId,
  pollUrl,
  onUpdateVote,
  onVote,
  getDifficultyText
}) => {
  const navigate = useNavigate()

  if (showUnvoted) {
    return unvotedOptions.length > 0 ? (
      <UnvotedTable
        options={unvotedOptions}
        isLoading={isLoading}
        onVote={onVote}
        pollUrl={pollUrl}
      />
    ) : (
      <div className="text-center p-lg">
        <p className="text-muted">
          {!searchQuery
            ? "No hay palabras sin votar."
            : "No se encontraron palabras no votadas que coincidan con tu búsqueda."}
        </p>
      </div>
    )
  }

  return votes.length > 0 ? (
    <VotesTable
      votes={votes}
      isLoading={isLoading}
      onUpdateVote={onUpdateVote}
      getDifficultyText={getDifficultyText}
      pollUrl={pollUrl}
    />
  ) : (
    <div className="flex flex-col gap-sm justify-center align-center w-100 p-lg">
      <p className="text-center text-muted">
        {!searchQuery
          ? "No hay votos en tu listado. Usa el botón de arriba para ir a votar."
          : "No se encontraron votos que coincidan con tu búsqueda."}
      </p>
      {!searchQuery && (
        <button
          className="btn btn-primary mt-4"
          onClick={() => navigate(`/vote?pollId=${pollId}`)}
        >
          Ir a votar
        </button>
      )}
    </div>
  )
}
