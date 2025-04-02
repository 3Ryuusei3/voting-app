import VotingCard from './VotingCard'
import { VoteStats } from './VoteStats'
import type { Option, VoteHistory } from '../types'

interface VoteContainerProps {
  option: Option
  onVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  onUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  isLoading: boolean
  voteHistory: VoteHistory[]
  previousVotes: VoteHistory[]
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

export const VoteContainer = ({
  option,
  onVote,
  onUpdateVote,
  isLoading,
  voteHistory,
  previousVotes,
  handleUndo,
  pollUrl,
  optionCounts
}: VoteContainerProps) => {
  return (
    <div className="flex flex-col align-center gap-md w-100">
      <VotingCard
        option={option}
        onVote={onVote}
        onUpdateVote={onUpdateVote}
        isLoading={isLoading}
        voteHistory={voteHistory}
        previousVotes={previousVotes}
        handleUndo={handleUndo}
        pollUrl={pollUrl}
      />

      <VoteStats optionCounts={optionCounts} />
    </div>
  )
}
