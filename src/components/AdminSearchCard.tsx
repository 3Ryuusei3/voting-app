import { SearchBar } from './SearchBar'
import { AdminVotesTable } from './AdminVotesTable'
import type { AdminVoteRow } from '../lib/adminService'

interface AdminSearchCardProps {
  rows: AdminVoteRow[]
  isLoading: boolean
  error: string | null
  searchInput: string
  searchQuery: string
  hasSearched: boolean
  exactWordMatch: boolean
  pollUrl: string | null
  onSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSearch: () => void
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onClear: () => void
  onToggleExactWordMatch: () => void
  onUpdateVote: (voteId: number, filter: 'easy' | 'difficult' | 'not_exist') => void
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
}

export const AdminSearchCard = ({
  rows,
  isLoading,
  error,
  searchInput,
  searchQuery,
  hasSearched,
  exactWordMatch,
  pollUrl,
  onSearchInput,
  onSearch,
  onKeyPress,
  onClear,
  onToggleExactWordMatch,
  onUpdateVote,
  getDifficultyText
}: AdminSearchCardProps) => {
  return (
    <div className="card card__history mb-xs">
      <div className="card-body gap-sm">
        <div className="flex flex-col gap-2xs">
          <h3 className="font-medium">Gestión de votos por palabra</h3>
          <p className="text-muted text-small">
            Busca una palabra para ver los votos de todos los usuarios y cambiarlos si es necesario.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-xs justify-center align-center bp-sm">
          <SearchBar
            searchInput={searchInput}
            onSearchInput={onSearchInput}
            onSearch={onSearch}
            onKeyPress={onKeyPress}
            isLoading={isLoading}
            isSearchDisabled={!searchInput.trim()}
            placeholder="Buscar palabra..."
            onClearFilters={onClear}
            showClearButton={searchInput.length > 0 || hasSearched || exactWordMatch}
            exactWordMatch={exactWordMatch}
            onToggleExactWordMatch={onToggleExactWordMatch}
          />
        </div>

        <div>
          {!hasSearched ? (
            <div className="text-center p-lg">
              <p className="text-muted">
                Introduce una palabra y pulsa buscar para ver los votos de los usuarios.
              </p>
            </div>
          ) : isLoading && rows.length === 0 ? (
            <div className="text-center p-lg">
              <p className="text-muted">Buscando votos...</p>
            </div>
          ) : rows.length > 0 ? (
            <AdminVotesTable
              rows={rows}
              isLoading={isLoading}
              onUpdateVote={onUpdateVote}
              getDifficultyText={getDifficultyText}
              pollUrl={pollUrl}
            />
          ) : (
            <div className="text-center p-lg">
              <p className="text-muted">
                No se han encontrado votos para "{searchQuery}".
              </p>
            </div>
          )}
        </div>

        {hasSearched && rows.length > 0 && (
          <p className="text-muted text-small text-right">
            {rows.length} {rows.length === 1 ? 'voto' : 'votos'} encontrados
          </p>
        )}
      </div>
    </div>
  )
}
