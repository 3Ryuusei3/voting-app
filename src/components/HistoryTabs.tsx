import filterIcon from '../assets/filter-icon.svg'

interface HistoryTabsProps {
  showUnvoted: boolean
  isLoading: boolean
  showFilters: boolean
  onToggleUnvoted: (show: boolean) => void
  onToggleFilters: () => void
}

export const HistoryTabs = ({
  showUnvoted,
  isLoading,
  showFilters,
  onToggleUnvoted,
  onToggleFilters
}: HistoryTabsProps) => {
  return (
    <div className="section-btn-group">
      <button
        className={`btn btn-xs ${showUnvoted ? 'btn-secondary' : 'btn-primary'} text-join`}
        onClick={() => onToggleUnvoted(false)}
        disabled={isLoading}
      >
        Votadas
      </button>
      <button
        className={`filter-btn btn btn-xs-square ${showFilters ? 'btn-white' : 'btn-gray'} btn-primary`}
        onClick={onToggleFilters}
        disabled={isLoading}
      >
        <img src={filterIcon} alt="Mostrar filtros" width={16} height={16} />
      </button>
      <button
        className={`btn btn-xs ${showUnvoted ? 'btn-primary' : 'btn-secondary'} text-join`}
        onClick={() => onToggleUnvoted(true)}
        disabled={isLoading}
      >
        Sin votar
      </button>
    </div>
  )
}
