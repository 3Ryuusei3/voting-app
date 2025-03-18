import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getVoteHistory, updateVote } from '../lib/wordService'
import type { Vote, Word } from '../types'
import searchIcon from '../assets/search-icon.svg'
import arrowLeftIcon from '../assets/arrow-left-icon.svg'
import arrowRightIcon from '../assets/arrow-right-icon.svg'

interface VoteWithWord extends Vote {
  word: Word
}

type DifficultyFilter = 'all' | 'easy' | 'difficult' | 'not_exist'

const HistoryPage = () => {
  const { user, isAuthenticated, isCheckingUser } = useAuth()
  const navigate = useNavigate()
  const [votes, setVotes] = useState<VoteWithWord[]>([])
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

  // Load votes
  useEffect(() => {
    if (!user) return

    const loadVotes = async () => {
      if (!votes.length) {
        setIsInitialLoading(true)
      }
      setIsLoading(true)
      setError(null)

      try {
        const { votes: newVotes, total } = await getVoteHistory(user.id, currentPage, pageSize, searchQuery, difficultyFilter)
        setVotes(newVotes)
        setTotalVotes(total)
      } catch (err) {
        setError('Error al cargar el historial de votos. Por favor, intenta de nuevo.')
        console.error('Error al cargar votos:', err)
      } finally {
        setIsLoading(false)
        setIsInitialLoading(false)
        setDataLoaded(true)
      }
    }

    loadVotes()
  }, [user, currentPage, searchQuery, difficultyFilter])

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

  const handleDifficultyFilter = (filter: DifficultyFilter) => {
    setDifficultyFilter(filter)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  const totalPages = Math.ceil(totalVotes / pageSize)

  // Show loading state while checking authentication
  if (isCheckingUser) {
    return (
      <div className="container ">
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
      ) : votes.length === 0 ? (
        <div className="card mb-lg">
          <div className="card-body text-center">
            <p className="text-muted">No hay votos en tu historial.</p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => navigate('/vote')}
            >
              Ir a votar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2xs justify-center align-center w-100">
          <div className="card mb-sm">
            <div className="card-body">
              <div className="flex gap-sm justify-center align-center bp-sm">
                <div className="flex items-center gap-sm w-100">
                  <button
                    className="btn btn-xs btn-outline btn-primary"
                    onClick={handleSearch}
                    disabled={isLoading}
                  >
                    <img src={searchIcon} alt="Buscar" width={16} height={16} />
                  </button>
                  <input
                    type="text"
                    placeholder="Buscar palabra..."
                    value={searchInput}
                    onChange={handleSearchInput}
                    onKeyUp={handleKeyPress}
                    className="w-100"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2xs">
                  <button
                    className={`btn btn-xs btn-primary ${difficultyFilter === 'all' ? 'prev-vote' : ''}`}
                    onClick={() => handleDifficultyFilter('all')}
                    disabled={isLoading}
                  >
                    <strong>T</strong>
                  </button>
                  <button
                    className={`btn btn-xs btn-success ${difficultyFilter === 'easy' ? 'prev-vote' : ''}`}
                    onClick={() => handleDifficultyFilter('easy')}
                    disabled={isLoading}
                  >
                    <strong>F</strong>
                  </button>
                  <button
                    className={`btn btn-xs btn-error ${difficultyFilter === 'difficult' ? 'prev-vote' : ''}`}
                    onClick={() => handleDifficultyFilter('difficult')}
                    disabled={isLoading}
                  >
                    <strong>D</strong>
                  </button>
                  <button
                    className={`btn btn-xs btn-tertiary ${difficultyFilter === 'not_exist' ? 'prev-vote' : ''}`}
                    onClick={() => handleDifficultyFilter('not_exist')}
                    disabled={isLoading}
                  >
                    <strong>N</strong>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-100">
                  <thead>
                    <tr className="border-b border-clr-border">
                      <th className="text-left p-xs text-muted text-small w-100">Palabra</th>
                      <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Fecha</th>
                      <th className="text-left p-xs text-muted text-small whitespace-nowrap w-fit">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((vote) => (
                      <tr key={vote.id} className="border-b border-clr-border">
                        <td className="p-2xs">
                          <h3 className="text-xl font-bold mb-6">
                            {vote.word ? (
                              <Link
                                to={`https://dle.rae.es/${vote.word.word}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {vote.word.word.toUpperCase()}
                              </Link>
                            ) : (
                              <span className="text-muted">Palabra no encontrada</span>
                            )}
                          </h3>
                        </td>
                        <td className="p-xs text-extra-small">
                          {new Date(vote.created_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) + 'H ' + new Date(vote.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }).split('/').join('/')}
                        </td>
                        <td className="p-xs">
                          <div className="flex gap-2xs">
                            <button
                              className={`btn btn-xs btn-success ${getDifficultyText(vote.difficult) === 'Fácil' ? 'prev-vote' : ''}`}
                              onClick={() => handleUpdateVote(vote.word_id, 'easy')}
                              disabled={isLoading}
                            >
                              <strong>F</strong>
                            </button>
                            <button
                              className={`btn btn-xs btn-error ${getDifficultyText(vote.difficult) === 'Difícil' ? 'prev-vote' : ''}`}
                              onClick={() => handleUpdateVote(vote.word_id, 'difficult')}
                              disabled={isLoading}
                            >
                              <strong>D</strong>
                            </button>
                            <button
                              className={`btn btn-xs btn-tertiary ${getDifficultyText(vote.difficult) === 'No existe' ? 'prev-vote' : ''}`}
                              onClick={() => handleUpdateVote(vote.word_id, 'not_exist')}
                              disabled={isLoading}
                            >
                              <strong>N</strong>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-sm">
              <button
                className="btn btn-xs btn-secondary"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <img src={arrowLeftIcon} alt="Anterior" width={16} height={16} />
              </button>
              <span className="flex items-center text-small">
                Página {currentPage} de {totalPages}
              </span>
              <button
                className="btn btn-xs btn-secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                <img src={arrowRightIcon} alt="Siguiente" width={16} height={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
