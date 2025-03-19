import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getVoteHistory, updateVote, getUnvotedWords } from '../lib/historyService'
import { submitVote } from '../lib/wordService'
import type { Vote, Word, DifficultyFilter } from '../types'
import { SearchBar } from '../components/SearchBar'
import { DifficultyFilters } from '../components/DifficultyFilters'
import { VotesTable } from '../components/VotesTable'
import { UnvotedWordsTable } from '../components/UnvotedWordsTable'
import { Pagination } from '../components/Pagination'

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
          if (!searchQuery) {
            setUnvotedWords([])
            setTotalVotes(0)
          } else {
            const { words, total } = await getUnvotedWords(user.id, currentPage, pageSize, searchQuery)
            setUnvotedWords(words)
            setTotalVotes(total)
          }
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
    if (searchInput.length < 3) return
    setSearchQuery(searchInput)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.length >= 3) {
      handleSearch()
    }
  }

  const getSearchPlaceholder = () => {
    if (searchInput.length > 0 && searchInput.length < 3) {
      return `Introduce al menos ${3 - searchInput.length} caracter${3 - searchInput.length === 1 ? 'e' : 'es'} más...`
    }
    return "Buscar con al menos 3 letras..."
  }

  const isSearchDisabled = searchInput.length < 3

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

  // Reset page when switching views
  useEffect(() => {
    setCurrentPage(1)
  }, [showUnvoted])

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
          <p className="text-muted text-large">Cargando historial...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2xs justify-center align-center w-100">
          <div className="card card__history mb-sm">
            <div className="card-body">
              <div className="flex gap-sm justify-center align-center bp-sm">
                <SearchBar
                  searchInput={searchInput}
                  onSearchInput={handleSearchInput}
                  onSearch={handleSearch}
                  onKeyPress={handleKeyPress}
                  isLoading={isLoading}
                  isSearchDisabled={isSearchDisabled}
                  placeholder={getSearchPlaceholder()}
                />
                <div className="flex gap-2xs">
                  {!showUnvoted && (
                    <DifficultyFilters
                      currentFilter={difficultyFilter}
                      onFilterChange={handleDifficultyFilter}
                      isLoading={isLoading}
                    />
                  )}
                  <button
                    className={`btn btn-xs ${showUnvoted ? 'btn-primary' : 'btn-secondary'} text-join`}
                    onClick={() => {
                      setShowUnvoted(!showUnvoted)
                      setCurrentPage(1)
                      setSearchInput('')
                      setSearchQuery('')
                    }}
                    disabled={isLoading}
                  >
                    {showUnvoted ? 'Votadas' : 'Sin votar'}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {showUnvoted ? (
                  !searchQuery ? (
                    <div className="text-center p-lg">
                      <p className="text-muted">Introduce un término de al menos 3 caracteres en el campo de búsqueda para ver palabras sin votar.</p>
                    </div>
                  ) : unvotedWords.length > 0 ? (
                    <UnvotedWordsTable
                      words={unvotedWords}
                      isLoading={isLoading}
                      onVote={handleVote}
                    />
                  ) : (
                    <div className="text-center p-lg">
                      <p className="text-muted">No se encontraron palabras no votadas que coincidan con tu búsqueda.</p>
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
                          ? "No hay votos en tu historial. Usa el botón de arriba para ir a votar."
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
