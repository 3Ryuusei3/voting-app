import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import VotingCard from '../components/VotingCard'
import WordStats from '../components/WordStats'
import { getUnvotedWords, submitVote, getWordCounts } from '../lib/wordService'
import type { Word } from '../types'

const VotePage = () => {
  const { user, isAuthenticated, isCheckingUser } = useAuth()
  const navigate = useNavigate()
  const [words, setWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wordCounts, setWordCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyWords: 0,
    difficultWords: 0,
    notExistWords: 0
  })
  const [dataLoaded, setDataLoaded] = useState(false)

  // Redirigir si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded])

  const loadWordCounts = useCallback(async () => {
    if (!user) return

    try {
      const counts = await getWordCounts(user.id)
      setWordCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
    }
  }, [user])

  const loadWords = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const unvotedWords = await getUnvotedWords(user.id, 500)
      setWords(unvotedWords)

      // If we didn't get any words, show a message
      if (unvotedWords.length === 0) {
        setError('No hay más palabras disponibles para votar en este momento. Es posible que hayas votado todas las palabras disponibles o que estemos experimentando problemas técnicos.')
      }
    } catch (err) {
      setError('Error al cargar palabras. Por favor, intenta de nuevo.')
      console.error('Error al cargar palabras:', err)
    } finally {
      setIsLoading(false)
      setDataLoaded(true)
    }
  }, [user])

  // Cargar palabras no votadas y conteos
  useEffect(() => {
    if (user && !dataLoaded) {
      loadWords()
      loadWordCounts()
    }
  }, [user, dataLoaded, loadWords, loadWordCounts])

  const handleVote = async (wordId: number, difficult: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await submitVote(user.id, wordId, difficult)

      // Eliminar la palabra votada de la lista local
      setWords(prevWords => prevWords.filter(word => word.id !== wordId))

      // Actualizar conteos
      await loadWordCounts()

      // Si no quedan palabras, cargar más
      if (words.length <= 1) {
        await loadWords()
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar el voto'
      setError(errorMessage)
      console.error('Error al votar:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Si no hay palabras para votar
  if (words.length === 0 && !isLoading && dataLoaded) {
    return (
      <div className="container p-xl">
        <div className="card max-w-md w-full mx-auto">
          <div className="card-body text-center">
            <h2 className="text-xl font-medium mb-4">¡Has votado todas las palabras disponibles!</h2>
            <p className="text-muted mb-6">Vuelve más tarde para votar nuevas palabras.</p>
            <div className="mb-6">
              <p className="font-medium mb-2">Estadísticas:</p>
              <WordStats wordCounts={wordCounts} />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container p-xl">
      {error && (
        <div className="alert alert-error mb-6 max-w-md mx-auto">
          <p>{error}</p>
        </div>
      )}

      {words.length > 0 && (
        <div className="flex flex-col align-center gap-md w-100">
          <VotingCard
            word={words[0]}
            onVote={handleVote}
            isLoading={isLoading}
          />
          <div className="text-center mb-4 w-100 mw-500">
            <div className="mx-auto mb-4">
              <div className="flex justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  <span className="text-small">Difíciles: {wordCounts.difficultWords}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-small">Fáciles: {wordCounts.easyWords}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-small">No existen: {wordCounts.notExistWords}</span>
                </div>
              </div>

              <WordStats
                wordCounts={wordCounts}
                showDetailedStats={false}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && words.length === 0 && (
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Cargando palabras...</p>
        </div>
      )}
    </div>
  )
}

export default VotePage
