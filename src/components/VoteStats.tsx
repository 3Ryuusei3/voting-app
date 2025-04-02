import OptionStats from './OptionStats'

interface VoteStatsProps {
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
}

export const VoteStats = ({ optionCounts }: VoteStatsProps) => {
  return (
    <div className="text-center mb-4 w-100 mw-500">
      <div className="mx-auto mb-4">
        <div className="flex justify-between gap-sm">
          <div className="flex items-center gap-sm">
            <span className="text-small">Difíciles: {optionCounts.difficultOptions}</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-small">Fáciles: {optionCounts.easyOptions}</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-small">No existen: {optionCounts.notExistOptions}</span>
          </div>
        </div>

        <OptionStats
          optionCounts={optionCounts}
          showDetailedStats={false}
          className="mt-2"
        />
      </div>
    </div>
  )
}
