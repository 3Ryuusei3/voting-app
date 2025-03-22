interface OptionStatsProps {
  optionCounts: {
    voted: number
    unvoted: number
    total: number
  }
  showDetailedStats?: boolean
  className?: string
}

const OptionStats = ({
  optionCounts,
  showDetailedStats = true,
  className = ''
}: OptionStatsProps) => {
  const totalProgressPercentage = optionCounts.total > 0
    ? Math.floor((optionCounts.voted / optionCounts.total) * 100)
    : 0

  return (
    <div className={className}>
      <div className="mb-4">
        {showDetailedStats && <p className="text-left mb-1">Progreso total:</p>}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${totalProgressPercentage}%` }}
            aria-valuenow={totalProgressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {totalProgressPercentage > 5 && `${totalProgressPercentage}%`}
          </div>
        </div>
          <div className="text-small mt-sm flex justify-between">
            {totalProgressPercentage <= 5 && (
              <p>{totalProgressPercentage}%</p>
            )}
            <p className="ml-auto">{optionCounts.voted} de {optionCounts.total} por votar</p>
          </div>
      </div>

      {showDetailedStats && (
        <div className="mt-4">
          <p>Has votado {optionCounts.voted} de {optionCounts.total} palabras totales.</p>
        </div>
      )}
    </div>
  )
}

export default OptionStats
