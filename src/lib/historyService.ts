import { supabase } from './supabase'
import type { Option, Vote } from '../types'
import { getCachedOptionCounts, getUnvotedOptions } from './optionService'

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

export { getCachedOptionCounts, getUnvotedOptions }

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
      poll_id: pollId,
      option: {
        id: row.option_id,
        option: row.option,
        created_at: row.created_at,
        poll_id: pollId
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
  pollId: number,
  filter: 'easy' | 'difficult' | 'not_exist'
): Promise<Vote> {
  try {
    const { data, error } = await supabase
      .rpc('update_vote_by_poll_id', {
        p_user_id: userId,
        p_option_id: optionId,
        p_poll_id: pollId,
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
