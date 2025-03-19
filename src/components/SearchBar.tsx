import searchIcon from '../assets/search-icon.svg'
import unfilterIcon from '../assets/unfilter-icon.svg'

interface SearchBarProps {
  searchInput: string
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  isSearchDisabled: boolean
  placeholder: string
  onClearFilters: () => void
  showClearButton: boolean
}

export const SearchBar = ({
  searchInput,
  onSearchInput,
  onSearch,
  onKeyPress,
  isLoading,
  isSearchDisabled,
  placeholder,
  onClearFilters,
  showClearButton
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-sm w-100">
      <button
        className="btn btn-xs-square btn-outline btn-primary"
        onClick={onSearch}
        disabled={isLoading || isSearchDisabled}
      >
        <img src={searchIcon} alt="Buscar" width={16} height={16} />
      </button>
      <input
        type="text"
        placeholder={placeholder}
        value={searchInput}
        onChange={onSearchInput}
        onKeyUp={onKeyPress}
        className="w-100"
        disabled={isLoading}
      />
      <button
        className={`btn btn-xs-square btn-white clear-filters ${showClearButton ? '' : 'hidden'}`}
        onClick={onClearFilters}
      >
        <img src={unfilterIcon} alt="Limpiar filtros" width={16} height={16} />
      </button>
    </div>
  )
}
