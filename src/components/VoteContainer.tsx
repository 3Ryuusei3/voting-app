import React from 'react'
import VotingCard from './VotingCard'
import { VoteStats } from './VoteStats'
import type { Option, VoteHistory } from '../types'

interface VoteContainerProps {
  option: Option
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
  voteHistory: VoteHistory[]
  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleUndo: () => Promise<void>
  pollUrl: string | null
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
}

export const VoteContainer: React.FC<VoteContainerProps> = ({
  option,
  onVote,
  isLoading,
  voteHistory,
  onUpdateVote,
  handleUndo,
  pollUrl,
  optionCounts
}) => {
  return (
    <div className="flex flex-col align-center gap-md w-100">
      <VotingCard
        option={option}
        onVote={onVote}
        isLoading={isLoading}
        voteHistory={voteHistory}
        onUpdateVote={onUpdateVote}
        handleUndo={handleUndo}
        pollUrl={pollUrl}
      />

      <VoteStats optionCounts={optionCounts} />
    </div>
  )
}
