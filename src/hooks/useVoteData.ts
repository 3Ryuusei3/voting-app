import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getUnvotedOptions, submitVote, updateVote, getOptionCounts } from '../lib/optionService'
import { getPollById } from '../lib/pollsService'
import type { VoteHistory, Option } from '../types'

interface VoteState {
  options: Option[]
  isLoading: boolean
  error: string | null
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
  dataLoaded: boolean
  voteHistory: VoteHistory[]
  currentOptionIndex: number
  pollUrl: string | null
}

interface VoteActions {
  handleVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleUndo: () => Promise<void>
  handleUpdateVote: (optionId: number, newFilter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
}

export const useVoteData = (pollId: number): [VoteState, VoteActions] => {
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
  const [pollUrl, setPollUrl] = useState<string | null>(null)

  // Load poll URL
  useEffect(() => {
    if (!pollId) return

    const loadPollUrl = async () => {
      try {
        const poll = await getPollById(pollId)
        setPollUrl(poll.url)
      } catch (err) {
        console.error('Error al cargar URL de la encuesta:', err)
      }
    }

    loadPollUrl()
  }, [pollId])

  // Redirigir si el usuario no está autenticado o si no hay pollId
  useEffect(() => {
    if ((!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) || !pollId) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded, pollId])

  const loadOptionCounts = useCallback(async () => {
    if (!user || !pollId) return

    try {
      const counts = await getOptionCounts(user.id, pollId)
      setOptionCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
    }
  }, [user, pollId])

  const loadOptions = useCallback(async () => {
    if (!user || !pollId) return

    setIsLoading(true)
    setError(null)

    try {
      const { options: unvotedOptions } = await getUnvotedOptions(user.id, pollId, 1, 500)
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
  }, [user, pollId])

  // Cargar palabras no votadas y conteos
  useEffect(() => {
    if (user && !dataLoaded && pollId) {
      loadOptions()
      loadOptionCounts()
    }
  }, [user, dataLoaded, loadOptions, loadOptionCounts, pollId])

  const handleVote = async (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user || !pollId) return

    setIsLoading(true)
    setError(null)

    try {
      const option = options.find(w => w.id === optionId)
      if (!option) throw new Error('Option not found')

      // Add to history before submitting vote
      setVoteHistory(prev => [...prev, { ...option, filter: filter }])

      await submitVote(user.id, optionId, pollId, filter)

      // Actualizar conteos forzando refresco del caché
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

      // Update counts forzando refresco del caché
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

      // Update counts forzando refresco del caché
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

  const state: VoteState = {
    options,
    isLoading,
    error,
    optionCounts,
    dataLoaded,
    voteHistory,
    currentOptionIndex,
    pollUrl
  }

  const actions: VoteActions = {
    handleVote,
    handleUndo,
    handleUpdateVote
  }

  return [state, actions]
}
