import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import VotingCard from '../components/VotingCard'
import OptionStats from '../components/OptionStats'
import { getUnvotedOptions, submitVote, getOptionCounts, updateVote } from '../lib/optionService'
import type { VoteHistory, Option } from '../types'

const VotePage = () => {
  const { user, isAuthenticated, isCheckingUser } = useAuth()
  const navigate = useNavigate()
  const [options, setOptions] = useState<Option[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optionCounts, setOptionCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyOptions: 0,
    difficultOptions: 0,
    notExistOptions: 0
  })
  const [dataLoaded, setDataLoaded] = useState(false)
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([])
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0)

  // Redirigir si el usuario no está autenticado
  useEffect(() => {
    if (!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded])

  const loadOptionCounts = useCallback(async () => {
    if (!user) return

    try {
      const counts = await getOptionCounts(user.id)
      setOptionCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
    }
  }, [user])

  const loadOptions = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const unvotedOptions = await getUnvotedOptions(user.id, 500)
      setOptions(unvotedOptions)

      // If we didn't get any options, show a message
      if (unvotedOptions.length === 0) {
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
      loadOptions()
      loadOptionCounts()
    }
  }, [user, dataLoaded, loadOptions, loadOptionCounts])

  const handleVote = async (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const option = options.find(w => w.id === optionId)
      if (!option) throw new Error('Option not found')

      // Add to history before submitting vote
      setVoteHistory(prev => [...prev, { ...option, filter: filter }])

      await submitVote(user.id, optionId, filter)

      // Actualizar conteos
      await loadOptionCounts()

      // Pasar a la siguiente palabra
      setCurrentOptionIndex(prev => prev + 1)

      // Si llegamos al final del array, cargar más palabras
      if (currentOptionIndex >= options.length - 1) {
        await loadOptions()
        setCurrentOptionIndex(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar el voto'
      setError(errorMessage)
      console.error('Error al votar:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!user || voteHistory.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      // Volver a la palabra anterior sin modificar el listado
      setCurrentOptionIndex(prev => Math.max(0, prev - 1))

      // Update counts
      await loadOptionCounts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al deshacer el voto'
      setError(errorMessage)
      console.error('Error al deshacer voto:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVote = async (optionId: number, newFilter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await updateVote(user.id, optionId, newFilter)

      // Update the vote in history
      setVoteHistory(prev =>
        prev.map(vote =>
          vote.id === optionId
            ? { ...vote, filter: newFilter }
            : vote
        )
      )

      // Update counts
      await loadOptionCounts()

      // Pasar a la siguiente palabra
      setCurrentOptionIndex(prev => prev + 1)

      // Si llegamos al final del array, cargar más palabras
      if (currentOptionIndex >= options.length - 1) {
        await loadOptions()
        setCurrentOptionIndex(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el voto'
      setError(errorMessage)
      console.error('Error al actualizar voto:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Si no hay palabras para votar
  if (options.length === 0 && !isLoading && dataLoaded) {
    return (
      <div className="container">
        <div className="card max-w-md w-full mx-auto">
          <div className="card-body gap-md text-center">
            <h2 className="text-xl font-medium mb-4">¡Has votado todas las palabras disponibles!</h2>
            <p className="text-muted mb-6">Vuelve más tarde para votar nuevas palabras.</p>
            <div className="mb-6">
              <p className="font-medium mb-2">Estadísticas:</p>
              <OptionStats optionCounts={optionCounts} />
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
    <div className="container">
      {error && (
        <div className="alert alert-error mb-6 max-w-md mx-auto">
          <p>{error}</p>
        </div>
      )}

      {options.length > 0 && (
        <div className="flex flex-col align-center gap-md w-100">
          <VotingCard
            option={options[currentOptionIndex]}
            onVote={handleVote}
            isLoading={isLoading}
            voteHistory={voteHistory}
            onUpdateVote={handleUpdateVote}
            handleUndo={handleUndo}
          />
          <div className="text-center mb-4 w-100 mw-500">
            <div className="mx-auto mb-4">
              <div className="flex justify-between gap-sm">
                <div className="flex items-center gap-sm">
                  <span className="text-small">Difíciles: {optionCounts.difficultOptions}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-small">Fáciles: {optionCounts.easyOptions}</span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="text-small">No existen: {optionCounts.notExistOptions}</span>
                </div>
              </div>

              <OptionStats
                optionCounts={optionCounts}
                showDetailedStats={false}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && options.length === 0 && (
        <div className="flex items-center justify-center">
          <p className="text-muted text-large">Cargando palabras...</p>
        </div>
      )}
    </div>
  )
}

export default VotePage
