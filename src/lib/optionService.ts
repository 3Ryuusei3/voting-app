import { supabase } from './supabase'
import type { Option, Vote } from '../types'

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
  pollId: number | null
} = {
  counts: null,
  timestamp: 0,
  userId: null,
  pollId: null
}

// Tiempo de expiración del caché (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000

/**
 * Obtiene los conteos de opciones con sistema de caché
 */
export async function getCachedOptionCounts(userId: string, pollId: number, forceRefresh = false) {
  const now = Date.now()

  // Usar caché si está disponible y no ha expirado
  if (
    !forceRefresh &&
    optionCountsCache.counts &&
    optionCountsCache.userId === userId &&
    optionCountsCache.pollId === pollId &&
    now - optionCountsCache.timestamp < CACHE_EXPIRATION
  ) {
    return optionCountsCache.counts
  }

  try {
    const { data, error } = await supabase
      .rpc('get_option_counts_by_poll_id', {
        p_user_id: userId,
        p_poll_id: pollId
      })

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
      userId,
      pollId
    }

    return counts
  } catch (error) {
    console.error('Error al obtener conteos:', error)
    throw error
  }
}

/**
 * Obtiene palabras que el usuario aún no ha votado en orden alfabético
 */
export async function getUnvotedOptions(
  userId: string,
  pollId: number,
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = ''
): Promise<{
  options: Option[]
  total: number
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_unvoted_options_by_poll_id', {
        p_user_id: userId,
        p_poll_id: pollId,
        p_page: page,
        p_page_size: pageSize,
        p_search_query: searchQuery
      }) as { data: { id: number; option: string; created_at: string; total: number }[] | null, error: Error | null }

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
      poll_id: pollId
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
 * Obtiene el conteo de palabras votadas y no votadas
 */
export async function getOptionCounts(userId: string, pollId: number): Promise<{
  voted: number,
  unvoted: number,
  total: number,
  easyOptions: number,
  difficultOptions: number,
  notExistOptions: number
}> {
  return getCachedOptionCounts(userId, pollId)
}

/**
 * Registra un voto del usuario
 */
export async function submitVote(userId: string, optionId: number, pollId: number, filter: 'easy' | 'difficult' | 'not_exist'): Promise<Vote> {
  // Verificar si el usuario ya ha votado esta palabra
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('option_id', optionId)
    .eq('poll_id', pollId)
    .single()

  if (existingVote) {
    return existingVote
  }

  // Registrar el voto
  const { data, error } = await supabase
    .from('votes')
    .insert([
      {
        user_id: userId,
        option_id: optionId,
        poll_id: pollId,
        filter: filter,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error al registrar voto:', error)
    throw error
  }

  return data
}

/**
 * Actualiza un voto existente
 */
export async function updateVote(userId: string, optionId: number, filter: 'easy' | 'difficult' | 'not_exist'): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .update({ filter })
    .eq('user_id', userId)
    .eq('option_id', optionId)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar voto:', error)
    throw error
  }

  return data
}

/**
 * Obtiene el historial de votos del usuario con paginación
 */
export async function getVoteHistory(
  userId: string,
  pollId: number,
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
      .rpc('get_vote_history_by_poll_id', {
        p_user_id: userId,
        p_poll_id: pollId,
        p_page: page,
        p_page_size: pageSize,
        p_search_query: searchQuery,
        p_filter: filterSelection
      })

    if (error) throw error

    return {
      votes: data[0]?.votes || [],
      total: Number(data[0]?.total_count) || 0
    }
  } catch (error) {
    console.error('Error al obtener historial de votos:', error)
    throw error
  }
}
