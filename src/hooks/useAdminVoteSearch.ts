import { useEffect, useState } from 'react'
import {
  adminSearchVotesByWord,
  adminUpdateUserVote,
  type AdminVoteRow
} from '../lib/adminService'
import { getPollById } from '../lib/pollsService'

interface AdminSearchState {
  rows: AdminVoteRow[]
  isLoading: boolean
  error: string | null
  searchInput: string
  searchQuery: string
  hasSearched: boolean
  exactWordMatch: boolean
  pollUrl: string | null
}

interface AdminSearchActions {
  handleSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSearch: () => void
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void
  handleClear: () => void
  handleToggleExactWordMatch: () => void
  handleUpdateVote: (voteId: number, filter: 'easy' | 'difficult' | 'not_exist') => Promise<void>
  getDifficultyText: (filter: 'easy' | 'difficult' | 'not_exist') => string
}

export const useAdminVoteSearch = (pollId: number): [AdminSearchState, AdminSearchActions] => {
  const [rows, setRows] = useState<AdminVoteRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [exactWordMatch, setExactWordMatch] = useState(false)
  const [pollUrl, setPollUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!pollId) return
    getPollById(pollId)
      .then(poll => setPollUrl(poll.url))
      .catch(err => console.error('Error al cargar URL de la encuesta:', err))
  }, [pollId])

  useEffect(() => {
    if (!pollId || !searchQuery) {
      setRows([])
      return
    }

    let cancelled = false
    const run = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminSearchVotesByWord(pollId, searchQuery, exactWordMatch)
        if (!cancelled) setRows(data)
      } catch (err) {
        if (!cancelled) {
          setError('Error al buscar votos. Comprueba que tienes permisos.')
          console.error(err)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()

    return () => {
      cancelled = true
    }
  }, [pollId, searchQuery, exactWordMatch])

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
    setError(null)
  }

  const handleSearch = () => {
    const trimmed = searchInput.trim()
    setSearchQuery(trimmed)
    setHasSearched(trimmed.length > 0)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleClear = () => {
    setSearchInput('')
    setSearchQuery('')
    setHasSearched(false)
    setExactWordMatch(false)
    setRows([])
    setError(null)
  }

  const handleToggleExactWordMatch = () => {
    setExactWordMatch(prev => !prev)
  }

  const handleUpdateVote = async (voteId: number, filter: 'easy' | 'difficult' | 'not_exist') => {
    setIsLoading(true)
    setError(null)
    try {
      await adminUpdateUserVote(voteId, filter)
      setRows(prev =>
        prev.map(row => (row.vote_id === voteId ? { ...row, filter } : row))
      )
    } catch (err) {
      setError('Error al actualizar el voto. Por favor, intenta de nuevo.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyText = (filter: 'easy' | 'difficult' | 'not_exist') => {
    switch (filter) {
      case 'easy': return 'Fácil'
      case 'difficult': return 'Difícil'
      case 'not_exist': return 'Eliminadas'
      default: return filter
    }
  }

  const state: AdminSearchState = {
    rows,
    isLoading,
    error,
    searchInput,
    searchQuery,
    hasSearched,
    exactWordMatch,
    pollUrl
  }

  const actions: AdminSearchActions = {
    handleSearchInput,
    handleSearch,
    handleKeyPress,
    handleClear,
    handleToggleExactWordMatch,
    handleUpdateVote,
    getDifficultyText
  }

  return [state, actions]
}
