interface WordStatsProps {
  wordCounts: {
    voted: number
    unvoted: number
    total: number
    easyWords: number
    difficultWords: number
    notExistWords: number
  }
  showDetailedStats?: boolean
  className?: string
}

const WordStats = ({
  wordCounts,
  showDetailedStats = true,
  className = ''
}: WordStatsProps) => {
  // Calculate progress percentage
  const totalProgressPercentage = wordCounts.total > 0
    ? Math.ceil((wordCounts.voted / wordCounts.total) * 100)
    : 0

  return (
    <div className={className}>
      {/* Total progress */}
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
        {totalProgressPercentage <= 5 && (
          <div className="text-small mt-sm flex justify-between">
            <p>{totalProgressPercentage}%</p>
            <p>{wordCounts.voted} de {wordCounts.total}</p>
          </div>
        )}
      </div>

      {showDetailedStats && (
        <div className="mt-4">
          <p>Has votado {wordCounts.voted} de {wordCounts.total} palabras totales.</p>
          <p>Palabras difíciles: {wordCounts.difficultWords}</p>
          <p>Palabras fáciles: {wordCounts.easyWords}</p>
          <p>Palabras que no existen: {wordCounts.notExistWords}</p>
        </div>
      )}
    </div>
  )
}

export default WordStats
