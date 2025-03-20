import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getVoteHistory, updateVote, getUnvotedWords } from '../lib/historyService'
import { submitVote, getWordCounts } from '../lib/wordService'
import type { Vote, Word, DifficultyFilter } from '../types'
import { SearchBar } from '../components/SearchBar'
import { DifficultyFilters } from '../components/DifficultyFilters'
import { VotesTable } from '../components/VotesTable'
import { UnvotedWordsTable } from '../components/UnvotedWordsTable'
import { Pagination } from '../components/Pagination'
import filterIcon from '../assets/filter-icon.svg'

interface VoteWithWord extends Vote {
  word: Word
}

const HistoryPage = () => {
  const { user, isAuthenticated, isCheckingUser } = useAuth()
  const navigate = useNavigate()
  const [votes, setVotes] = useState<VoteWithWord[]>([])
  const [unvotedWords, setUnvotedWords] = useState<Word[]>([])
  const [showUnvoted, setShowUnvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalVotes, setTotalVotes] = useState(0)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [wordCounts, setWordCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyWords: 0,
    difficultWords: 0,
    notExistWords: 0
  })
  const pageSize = 10

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded])

  // Load votes or unvoted words
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
          const { words, total } = await getUnvotedWords(user.id, currentPage, pageSize, searchQuery)
          setUnvotedWords(words)
          setTotalVotes(total)
        } else {
          const { votes: newVotes, total } = await getVoteHistory(user.id, currentPage, pageSize, searchQuery, difficultyFilter)
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
  }, [user, currentPage, searchQuery, difficultyFilter, showUnvoted])

  // Load word counts
  useEffect(() => {
    if (!user) return

    const loadWordCounts = async () => {
      try {
        const counts = await getWordCounts(user.id)
        setWordCounts(counts)
      } catch (err) {
        console.error('Error al cargar conteos de palabras:', err)
      }
    }

    loadWordCounts()
  }, [user])

  const handleUpdateVote = async (wordId: number, newDifficulty: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await updateVote(user.id, wordId, newDifficulty)

      // Update the vote in the local state
      setVotes(prevVotes =>
        prevVotes.map(vote =>
          vote.word_id === wordId
            ? { ...vote, difficult: newDifficulty }
            : vote
        )
      )
    } catch (err) {
      setError('Error al actualizar el voto. Por favor, intenta de nuevo.')
      console.error('Error al actualizar voto:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Fácil'
      case 'difficult':
        return 'Difícil'
      case 'not_exist':
        return 'No existe'
      default:
        return difficulty
    }
  }

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setError(null)
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1) // Reset to first page when searching
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

  const handleVote = async (wordId: number, difficult: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await submitVote(user.id, wordId, difficult)

      // Get updated word counts
      const counts = await getWordCounts(user.id)
      setWordCounts(counts)

      // Get updated data
      const { words, total } = await getUnvotedWords(user.id, currentPage, pageSize, searchQuery)
      setUnvotedWords(words)
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

  const showClearButton = searchInput.length > 0 || difficultyFilter !== 'all'

  const getCompletionPercentage = () => {
    if (showUnvoted) {
      return wordCounts.total > 0
        ? Number((wordCounts.unvoted / wordCounts.total) * 100).toFixed(2)
        : 0
    } else {
      if (difficultyFilter === 'all') {
        return wordCounts.total > 0
          ? Number(((wordCounts.voted / wordCounts.total) * 100).toFixed(2))
          : 0
      } else {
        const filteredCount = difficultyFilter === 'easy'
          ? wordCounts.easyWords
          : difficultyFilter === 'difficult'
            ? wordCounts.difficultWords
            : wordCounts.notExistWords

        return wordCounts.voted > 0
          ? Number((filteredCount / wordCounts.voted) * 100).toFixed(2)
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
                      currentFilter={difficultyFilter}
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
                  unvotedWords.length > 0 ? (
                    <UnvotedWordsTable
                      words={unvotedWords}
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

              {totalVotes > 0 && (
                <div className="text-center text-small text-muted mt-2">
                  <span>
                    <strong>{totalVotes}</strong>
                    {showUnvoted
                          ? ' palabras sin votar'
                          : difficultyFilter === 'all'
                            ? ' palabras votadas'
                            : ` de las votadas (${getDifficultyText(difficultyFilter)})`
                        }
                    {' '}
                    {wordCounts.total > 0 && (
                      <span className="ml-2">
                        <strong>({completionPercentage}%)</strong>
                      </span>
                    )}
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
