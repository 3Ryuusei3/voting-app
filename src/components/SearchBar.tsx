import searchIcon from '../assets/search-icon.svg'

interface SearchBarProps {
  searchInput: string
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isLoading: boolean
  isSearchDisabled: boolean
  placeholder: string
}

export const SearchBar = ({
  searchInput,
  onSearchInput,
  onSearch,
  onKeyPress,
  isLoading,
  isSearchDisabled,
  placeholder
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-sm w-100">
      <button
        className="btn btn-xs btn-outline btn-primary"
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
    </div>
  )
}
