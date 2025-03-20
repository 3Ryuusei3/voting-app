import { supabase } from './supabase'
import type { Option, Vote } from '../types'

/**
 * Obtiene palabras que el usuario aún no ha votado en orden alfabético
 */
export async function getUnvotedOptions(userId: string, limit = 10): Promise<Option[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_unvoted_options', {
        p_user_id: userId,
        p_page: 1,
        p_page_size: limit,
        p_search_query: ''
      })

    if (error) {
      console.error('Error al obtener palabras no votadas:', error)
      throw error
    }

    return data?.map((item: { id: number; option: string; created_at: string }) => ({
      id: item.id,
      option: item.option,
      created_at: item.created_at,
      poll_id: 1
    })) || []
  } catch (err) {
    console.error('Error en getUnvotedOptions:', err)
    throw err
  }
}

/**
 * Obtiene el conteo de palabras votadas y no votadas
 */
export async function getOptionCounts(userId: string): Promise<{
  voted: number,
  unvoted: number,
  total: number,
  easyOptions: number,
  difficultOptions: number,
  notExistOptions: number
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_option_counts', { p_user_id: userId })

    if (error) throw error

    const counts = data[0]
    return {
      voted: Number(counts.voted_count) || 0,
      unvoted: Number(counts.total_count - counts.voted_count) || 0,
      total: Number(counts.total_count) || 0,
      easyOptions: Number(counts.easy_count) || 0,
      difficultOptions: Number(counts.difficult_count) || 0,
      notExistOptions: Number(counts.not_exist_count) || 0
    }
  } catch (error) {
    console.error('Error al obtener conteos de palabras:', error)
    throw error
  }
}

/**
 * Registra un voto del usuario
 */
export async function submitVote(userId: string, optionId: number, filter: 'easy' | 'difficult' | 'not_exist'): Promise<Vote> {
  // Verificar si el usuario ya ha votado esta palabra
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('option_id', optionId)
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
        filter: filter,
        poll_id: 1,
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
