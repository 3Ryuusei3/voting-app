import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { getVoteHistory, updateVote, getUnvotedOptions, getCachedOptionCounts } from '../lib/historyService'
import { submitVote } from '../lib/optionService'
import { getPollById } from '../lib/pollsService'
import type { Vote, Option, DifficultyFilter } from '../types'

interface VoteWithOption extends Vote {
  option: Option
}

interface HistoryState {
  votes: VoteWithOption[]
  unvotedOptions: Option[]
  showUnvoted: boolean
  isLoading: boolean
  isInitialLoading: boolean
  error: string | null
  currentPage: number
  totalVotes: number
  totalPages: number
  dataLoaded: boolean
  searchQuery: string
  searchInput: string
  filterSelection: DifficultyFilter
  showFilters: boolean
  pollUrl: string | null
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
}

interface HistoryActions {
  setShowUnvoted: (show: boolean) => void
  handleUpdateVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleVote: (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSearch: () => void
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleDifficultyFilter: (filter: DifficultyFilter) => void
  handleClearFilters: () => void
  handleShowFilters: () => void
  setCurrentPage: (page: number) => void
  getSearchPlaceholder: () => string
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
  getCompletionPercentage: () => string | number
}

export const useHistoryData = (pollId: number): [HistoryState, HistoryActions] => {
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
  const [pollUrl, setPollUrl] = useState<string | null>(null)
  const [optionCounts, setOptionCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyOptions: 0,
    difficultOptions: 0,
    notExistOptions: 0
  })
  const pageSize = 10

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

  // Redirect if not authenticated or no pollId
  useEffect(() => {
    if ((!isAuthenticated && !isCheckingUser && !isLoading && dataLoaded) || !pollId) {
      navigate('/')
    }
  }, [isAuthenticated, isCheckingUser, navigate, isLoading, dataLoaded, pollId])

  // Load votes or unvoted options
  useEffect(() => {
    if (!user || !pollId) return

    const loadData = async () => {
      if (!votes.length && !showUnvoted) {
        setIsInitialLoading(true)
      }
      setIsLoading(true)
      setError(null)

      try {
        if (showUnvoted) {
          const { options, total } = await getUnvotedOptions(user.id, pollId, currentPage, pageSize, searchQuery)
          setUnvotedOptions(options)
          setTotalVotes(total)
        } else {
          const { votes: newVotes, total } = await getVoteHistory(user.id, pollId, currentPage, pageSize, searchQuery, filterSelection)
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
  }, [user, pollId, currentPage, searchQuery, filterSelection, showUnvoted, votes.length])

  // Función memoizada para cargar los conteos
  const loadOptionCounts = useCallback(async (forceRefresh = false) => {
    if (!user || !pollId) return

    try {
      const counts = await getCachedOptionCounts(user.id, pollId, forceRefresh)
      setOptionCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
    }
  }, [user, pollId])

  // Cargar conteos iniciales
  useEffect(() => {
    if (!user || !pollId) return
    loadOptionCounts()
  }, [user, pollId, loadOptionCounts])

  // Actualizar conteos después de votar
  const handleVote = async (optionId: number, filter: 'easy' | 'difficult' | 'not_exist') => {
    if (!user || !pollId) return

    setIsLoading(true)
    setError(null)

    try {
      await submitVote(user.id, optionId, pollId, filter)

      // Forzar actualización de conteos
      await loadOptionCounts(true)

      // Get updated data
      const { options, total } = await getUnvotedOptions(user.id, pollId, currentPage, pageSize, searchQuery)
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
    if (!user || !pollId) return

    setIsLoading(true)
    setError(null)

    try {
      await updateVote(user.id, optionId, pollId, newFilter)

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

  const state: HistoryState = {
    votes,
    unvotedOptions,
    showUnvoted,
    isLoading,
    isInitialLoading,
    error,
    currentPage,
    totalVotes,
    totalPages,
    dataLoaded,
    searchQuery,
    searchInput,
    filterSelection,
    showFilters,
    pollUrl,
    optionCounts
  }

  const actions: HistoryActions = {
    setShowUnvoted: (show: boolean) => {
      setShowUnvoted(show)
      setCurrentPage(1)
      setSearchInput('')
      setSearchQuery('')
    },
    handleUpdateVote,
    handleVote,
    handleSearchInput,
    handleSearch,
    handleKeyPress,
    handleDifficultyFilter,
    handleClearFilters,
    handleShowFilters,
    setCurrentPage,
    getSearchPlaceholder,
    getDifficultyText,
    getCompletionPercentage
  }

  return [state, actions]
}
