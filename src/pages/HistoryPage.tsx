import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getVoteHistory, updateVote, getUnvotedOptions, getCachedOptionCounts } from '../lib/historyService'
import { submitVote } from '../lib/optionService'
import type { Vote, Option, DifficultyFilter } from '../types'
import { SearchBar } from '../components/SearchBar'
import { DifficultyFilters } from '../components/DifficultyFilters'
import { VotesTable } from '../components/VotesTable'
import { UnvotedTable } from '../components/UnvotedTable'
import { Pagination } from '../components/Pagination'
import filterIcon from '../assets/filter-icon.svg'

interface VoteWithOption extends Vote {
  option: Option
}

const HistoryPage = () => {
  const { user, isAuthenticated, isCheckingUser } = useAuth()
  const navigate = useNavigate()
  const [votes, setVotes] = useState<VoteWithOption[]>([])
  const [unvotedOptions, setUnvotedOptions] = useState<Option[]>([])
  const [showUnvoted, setShowUnvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVotes, setTotalVotes] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterSelection, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [optionCounts, setOptionCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyOptions: 0,
    difficultOptions: 0,
    notExistOptions: 0
  })
  const pageSize = 10

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded])

  // Load votes or unvoted options
  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      if (!votes.length && !showUnvoted) {
        setIsInitialLoading(true)
      }
      setIsLoading(true)
      setError(null)

      try {
        if (showUnvoted) {
          const { options, total } = await getUnvotedOptions(user.id, currentPage, pageSize, searchQuery)
          setUnvotedOptions(options)
          setTotalVotes(total)
        } else {
          const { votes: newVotes, total } = await getVoteHistory(user.id, currentPage, pageSize, searchQuery, filterSelection)
          setVotes(newVotes)
          setTotalVotes(total)
        }
      } catch (err) {
        setError('Error al cargar los datos. Por favor, intenta de nuevo.')
        console.error('Error al cargar datos:', err)
      } finally {
        setIsLoading(false)
        setIsInitialLoading(false)
        setDataLoaded(true)
      }
    }

    loadData()
  }, [user, currentPage, searchQuery, filterSelection, showUnvoted])

  // Función memoizada para cargar los conteos
  const loadOptionCounts = useCallback(async (forceRefresh = false) => {
    if (!user) return

    try {
      const counts = await getCachedOptionCounts(user.id, forceRefresh)
      setOptionCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
    }
  }, [user])

  // Cargar conteos iniciales
  useEffect(() => {
    if (!user) return
    loadOptionCounts()
  }, [user, loadOptionCounts])

  // Actualizar conteos después de votar
  const handleVote = async (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await submitVote(user.id, optionId, filter)

      // Forzar actualización de conteos
      await loadOptionCounts(true)

      // Get updated data
      const { options, total } = await getUnvotedOptions(user.id, currentPage, pageSize, searchQuery)
      setUnvotedOptions(options)
      setTotalVotes(total)

      if (total === 0) {
        setCurrentPage(1)
      } else {
        const maxPage = Math.ceil(total / pageSize)
        if (currentPage > maxPage) {
          setCurrentPage(maxPage)
        }
      }
    } catch (err) {
      setError('Error al registrar el voto. Por favor, intenta de nuevo.')
      console.error('Error al votar:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar conteos después de cambiar un voto
  const handleUpdateVote = async (optionId: number, newFilter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await updateVote(user.id, optionId, newFilter)

      // Update the vote in the local state
      setVotes(prevVotes =>
        prevVotes.map(vote =>
          vote.option_id === optionId
            ? { ...vote, filter: newFilter }
            : vote
        )
      )

      // Forzar actualización de conteos
      await loadOptionCounts(true)
    } catch (err) {
      setError('Error al actualizar el voto. Por favor, intenta de nuevo.')
      console.error('Error al actualizar voto:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyText = (filter: 'easy' | 'difficult' | 'not_exist') => {
    switch (filter) {
      case 'easy':
        return 'Fácil'
      case 'difficult':
        return 'Difícil'
      case 'not_exist':
        return 'No existe'
      default:
        return filter
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setError(null)
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getSearchPlaceholder = () => {
    return "Buscar palabras..."
  }

  const isSearchDisabled = false

  const handleDifficultyFilter = (filter: DifficultyFilter) => {
    setDifficultyFilter(filter)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  // Calculate total pages, ensuring it's at least 1
  const totalPages = totalVotes === 0 ? 1 : Math.ceil(totalVotes / pageSize)

  // Ensure current page is valid
  useEffect(() => {
    if (totalVotes === 0) {
      setCurrentPage(1)
    } else {
      const maxPage = Math.ceil(totalVotes / pageSize)
      if (currentPage > maxPage) {
        setCurrentPage(maxPage)
      }
    }
  }, [totalVotes, currentPage])

  // Reset page and clear filters when switching views
  useEffect(() => {
    setCurrentPage(1)
    setSearchInput('')
    setSearchQuery('')
    setDifficultyFilter('all')
  }, [showUnvoted])

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setDifficultyFilter('all')
    setCurrentPage(1)
  }

  const handleShowFilters = () => {
    setShowFilters(!showFilters)
  }

  const showClearButton = searchInput.length > 0 || filterSelection !== 'all'

  const getCompletionPercentage = () => {
    if (showUnvoted) {
      return optionCounts.total > 0
        ? Number((optionCounts.unvoted / optionCounts.total) * 100).toFixed(2)
        : 0
    } else {
      if (filterSelection === 'all') {
        return optionCounts.total > 0
          ? Number(((optionCounts.voted / optionCounts.total) * 100).toFixed(2))
          : 0
      } else {
        const filteredCount = filterSelection === 'easy'
          ? optionCounts.easyOptions
          : filterSelection === 'difficult'
            ? optionCounts.difficultOptions
            : optionCounts.notExistOptions

        return optionCounts.voted > 0
          ? Number((filteredCount / optionCounts.voted) * 100).toFixed(2)
          : 0
      }
    }
  }

  const completionPercentage = getCompletionPercentage()

  // Show loading state while checking authentication
  if (isCheckingUser) {
    return (
      <div className="container">
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      {error && (
        <div className="alert alert-error mb-lg">
          <p>{error}</p>
        </div>
      )}

      {isInitialLoading ? (
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Cargando listado...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2xs justify-center align-center w-100">
          <div className="card card__history mb-xs">
            <div className="card-body gap-sm">
              <div className={`filter-section ${showFilters ? '' : 'hidden'} flex gap-xs justify-center align-center bp-sm`}>
                <SearchBar
                  searchInput={searchInput}
                  onSearchInput={handleSearchInput}
                  onSearch={handleSearch}
                  onKeyPress={handleKeyPress}
                  isLoading={isLoading}
                  isSearchDisabled={isSearchDisabled}
                  placeholder={getSearchPlaceholder()}
                  onClearFilters={handleClearFilters}
                  showClearButton={showClearButton}
                />
                <div className="flex gap-2xs">
                  {!showUnvoted && (
                    <DifficultyFilters
                      currentFilter={filterSelection}
                      onFilterChange={handleDifficultyFilter}
                      isLoading={isLoading}
                    />
                  )}
                </div>
              </div>

              <div className="section-btn-group">
                <button
                  className={`btn btn-xs ${showUnvoted ? 'btn-secondary' : 'btn-primary'} text-join`}
                  onClick={() => {
                    setShowUnvoted(false)
                    setCurrentPage(1)
                    setSearchInput('')
                    setSearchQuery('')
                  }}
                  disabled={isLoading}
                >
                  Votadas
                </button>
                <button
                  className={`filter-btn btn btn-xs-square ${showFilters ? 'btn-white' : 'btn-gray'}  btn-primary`}
                  onClick={() => {
                    handleShowFilters()
                  }}
                  disabled={isLoading || isSearchDisabled}
                >
                  <img src={filterIcon} alt="Mostrar filtros" width={16} height={16} />
                </button>
                <button
                  className={`btn btn-xs ${showUnvoted ? 'btn-primary' : 'btn-secondary'} text-join`}
                  onClick={() => {
                    setShowUnvoted(true)
                    setCurrentPage(1)
                    setSearchInput('')
                    setSearchQuery('')
                  }}
                  disabled={isLoading}
                >
                  Sin votar
                </button>
              </div>

              <div>
                {showUnvoted ? (
                  unvotedOptions.length > 0 ? (
                    <UnvotedTable
                      options={unvotedOptions}
                      isLoading={isLoading}
                      onVote={handleVote}
                    />
                  ) : (
                    <div className="text-center p-lg">
                      <p className="text-muted">
                        {!searchQuery
                          ? "No hay palabras sin votar."
                          : "No se encontraron palabras no votadas que coincidan con tu búsqueda."}
                      </p>
                    </div>
                  )
                ) : (
                  votes.length > 0 ? (
                    <VotesTable
                      votes={votes}
                      isLoading={isLoading}
                      onUpdateVote={handleUpdateVote}
                      getDifficultyText={getDifficultyText}
                    />
                  ) : (
                    <div className="text-center p-lg">
                      <p className="text-muted">
                        {!searchQuery
                          ? "No hay votos en tu listado. Usa el botón de arriba para ir a votar."
                          : "No se encontraron votos que coincidan con tu búsqueda."}
                      </p>
                      {!searchQuery && (
                        <button
                          className="btn btn-primary mt-4"
                          onClick={() => navigate('/vote')}
                        >
                          Ir a votar
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              {totalVotes > 0 && optionCounts.total > 0 && (
                <div className="text-center text-small text-muted mt-2">
                  <span>
                    <strong>{totalVotes}</strong>
                    {showUnvoted
                      ? ' palabras sin votar'
                      : filterSelection === 'all'
                        ? ' palabras votadas'
                        : ` de las votadas (${getDifficultyText(filterSelection)})`
                    }
                    {' '}
                    <span className="ml-2">
                      <strong>({completionPercentage}%)</strong>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}

export default HistoryPage
