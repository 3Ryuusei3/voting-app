import { useState } from 'react'
import arrowLeftIcon from '../assets/arrow-left-icon.svg'
import arrowRightIcon from '../assets/arrow-right-icon.svg'
import enterIcon from '../assets/enter-icon.svg'

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
  const [pageInput, setPageInput] = useState('')

  if (totalPages <= 1) return null

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageSearch = () => {
    const page = parseInt(pageInput)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setPageInput('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePageSearch()
    }
  }

  return (
    <div className="flex justify-between items-center gap-lg w-100 mw-500">
      <div className="flex gap-xs items-center">
        <button
          className="btn btn-xs-square btn-primary"
          onClick={handlePageSearch}
          disabled={isLoading || !pageInput || parseInt(pageInput) < 1 || parseInt(pageInput) > totalPages}
        >
          <img src={enterIcon} alt="Ir" width={16} height={16} />
        </button>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          onChange={handlePageInput}
          onKeyDown={handleKeyPress}
          placeholder="Ir a la página..."
          className="input input-xs w-20"
          disabled={isLoading}
        />
      </div>
      <div className="flex justify-center gap-sm">
        <button
          className="btn btn-xs-square btn-secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        >
          <img src={arrowLeftIcon} alt="Anterior" width={16} height={16} />
        </button>
        <span className="flex items-center text-small">
          {currentPage} de {totalPages}
        </span>
        <button
          className="btn btn-xs-square btn-secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        >
          <img src={arrowRightIcon} alt="Siguiente" width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
