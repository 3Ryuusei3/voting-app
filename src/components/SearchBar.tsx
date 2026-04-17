import searchIcon from "../assets/search-icon.svg";
import unfilterIcon from "../assets/unfilter-icon.svg";
import equalIcon from "../assets/equal-icon.svg";

interface SearchBarProps {
  searchInput: string;
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isSearchDisabled: boolean;
  placeholder: string;
  onClearFilters: () => void;
  showClearButton: boolean;
  exactWordMatch?: boolean;
  onToggleExactWordMatch?: () => void;
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
  showClearButton,
  exactWordMatch = false,
  onToggleExactWordMatch,
}: SearchBarProps) => {
  return (
    <div className="flex items-center gap-xs w-100">
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
      {onToggleExactWordMatch && (
        <button
          type="button"
          className={`btn btn-xs-square btn-outline btn-secondary ${exactWordMatch ? "prev-vote" : ""}`}
          onClick={onToggleExactWordMatch}
          disabled={isLoading}
          aria-pressed={exactWordMatch}
          aria-label={
            exactWordMatch
              ? "Desactivar búsqueda exacta de palabra"
              : "Activar búsqueda exacta de palabra"
          }
          title={
            exactWordMatch
              ? "Búsqueda exacta activa: solo la palabra escrita (p. ej. «alta», no «faltan»). Pulsa de nuevo para buscar por texto contenido."
              : "Activar búsqueda exacta: solo la palabra escrita, sin coincidencias parciales."
          }
        >
          <img
            src={equalIcon}
            alt=""
            width={16}
            height={16}
            aria-hidden={true}
          />
        </button>
      )}
      <button
        className={`btn btn-xs-square btn-white clear-filters ${showClearButton ? "" : "hidden"}`}
        onClick={onClearFilters}
      >
        <img src={unfilterIcon} alt="Limpiar filtros" width={16} height={16} />
      </button>
    </div>
  );
};
