import { supabase } from './supabase'
import type { Option, Vote } from '../types'

interface VoteHistoryRow {
  id: number
  user_id: string
  option_id: number
  filter: 'easy' | 'difficult' | 'not_exist'
  created_at: string
  option: string
  total: number
  poll_id?: number
}

interface UnvotedOptionResult {
  id: number
  option: string
  created_at: string
  total: number
}

// Cache para los conteos
let optionCountsCache: {
  counts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  } | null
  timestamp: number
  userId: string | null
} = {
  counts: null,
  timestamp: 0,
  userId: null
}

// Tiempo de expiración del caché (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * Obtiene los conteos de opciones con sistema de caché
 */
export async function getCachedOptionCounts(userId: string, forceRefresh = false) {
  const now = Date.now()

  // Usar caché si está disponible y no ha expirado
  if (
    !forceRefresh &&
    optionCountsCache.counts &&
    optionCountsCache.userId === userId &&
    now - optionCountsCache.timestamp < CACHE_EXPIRATION
  ) {
    return optionCountsCache.counts
  }

  try {
    const { data, error } = await supabase
      .rpc('get_option_counts', { p_user_id: userId })

    if (error) throw error

    const counts = {
      voted: Number(data[0].voted_count) || 0,
      unvoted: Number(data[0].total_count - data[0].voted_count) || 0,
      total: Number(data[0].total_count) || 0,
      easyOptions: Number(data[0].easy_count) || 0,
      difficultOptions: Number(data[0].difficult_count) || 0,
      notExistOptions: Number(data[0].not_exist_count) || 0
    }

    // Actualizar caché
    optionCountsCache = {
      counts,
      timestamp: now,
      userId
    }

    return counts
  } catch (error) {
    console.error('Error al obtener conteos:', error)
    throw error
  }
}

/**
 * Obtiene palabras que el usuario aún no ha votado
 */
export async function getUnvotedOptions(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = ''
): Promise<{
  options: Option[]
  total: number
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_unvoted_options', {
        p_user_id: userId,
        p_search_query: searchQuery,
        p_page: page,
        p_page_size: pageSize
      }) as { data: UnvotedOptionResult[] | null, error: Error | null }

    if (error) {
      console.error('Error al obtener palabras no votadas:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return { options: [], total: 0 }
    }

    const options: Option[] = data.map(item => ({
      id: item.id,
      option: item.option,
      created_at: item.created_at,
      poll_id: 1
    }))

    return {
      options,
      total: Number(data[0]?.total) || 0
    }
  } catch (err) {
    console.error('Error en getUnvotedOptions:', err)
    throw err
  }
}

/**
 * Obtiene el historial de votos del usuario con paginación
 */
export async function getVoteHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = '',
  filterSelection: 'all' | 'easy' | 'difficult' | 'not_exist' = 'all'
): Promise<{
  votes: (Vote & { option: Option })[]
  total: number
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_vote_history', {
        p_user_id: userId,
        p_page: page,
        p_page_size: pageSize,
        p_search_query: searchQuery,
        p_filter: filterSelection
      }) as { data: VoteHistoryRow[] | null, error: Error | null }

    if (error) throw error

    if (!data || data.length === 0) {
      return { votes: [], total: 0 }
    }

    const votes = data.map(row => ({
      id: row.id,
      user_id: row.user_id,
      option_id: row.option_id,
      filter: row.filter,
      created_at: row.created_at,
      poll_id: 1,
      option: {
        id: row.option_id,
        option: row.option,
        created_at: row.created_at,
        poll_id: 1
      }
    })) as (Vote & { option: Option })[]

    return {
      votes,
      total: Number(data[0]?.total) || 0
    }
  } catch (error) {
    console.error('Error al obtener historial de votos:', error)
    throw error
  }
}

/**
 * Actualiza un voto existente
 */
export async function updateVote(
  userId: string,
  optionId: number,
  filter: 'easy' | 'difficult' | 'not_exist'
): Promise<Vote> {
  try {
    const { data, error } = await supabase
      .rpc('update_vote', {
        p_user_id: userId,
        p_option_id: optionId,
        p_filter: filter
      }) as { data: Vote[] | null, error: Error | null }

    if (error) {
      console.error('Error al actualizar voto:', error)
      throw error
    }

    if (!data || data.length === 0) {
      throw new Error('No se encontró el voto para actualizar')
    }

    return data[0]
  } catch (error) {
    console.error('Error al actualizar voto:', error)
    throw error
  }
}
