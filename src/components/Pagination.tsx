import arrowLeftIcon from '../assets/arrow-left-icon.svg'
import arrowRightIcon from '../assets/arrow-right-icon.svg'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isLoading: boolean
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: PaginationProps) => {
  if (totalPages <= 1) return null

  return (
    <div className="flex justify-center gap-sm">
      <button
        className="btn btn-xs-square btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
      >
        <img src={arrowLeftIcon} alt="Anterior" width={16} height={16} />
      </button>
      <span className="flex items-center text-small">
        Página {currentPage} de {totalPages}
      </span>
      <button
        className="btn btn-xs-square btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
      >
        <img src={arrowRightIcon} alt="Siguiente" width={16} height={16} />
      </button>
    </div>
  )
}
