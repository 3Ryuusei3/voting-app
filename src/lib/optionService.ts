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
    // Obtener conteo de palabras votadas
    const { count: votedCount, error: votedError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (votedError) throw votedError

    // Obtener conteo de palabras marcadas como fáciles
    const { count: easyCount, error: easyError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('filter', 'easy')

    if (easyError) throw easyError

    // Obtener conteo de palabras marcadas como difíciles
    const { count: difficultCount, error: difficultError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('filter', 'difficult')

    if (difficultError) throw difficultError

    // Obtener conteo de palabras marcadas como no existentes
    const { count: notExistCount, error: notExistError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('filter', 'not_exist')

    if (notExistError) throw notExistError

    // Obtener conteo total de palabras
    const { count: totalCount, error: totalError } = await supabase
      .from('options')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Calcular palabras no votadas
    const safeVotedCount = votedCount || 0
    const safeTotalCount = totalCount || 0
    const safeEasyCount = easyCount || 0
    const safeDifficultCount = difficultCount || 0
    const safeNotExistCount = notExistCount || 0
    const unvotedCount = safeTotalCount - safeVotedCount

    return {
      voted: safeVotedCount,
      unvoted: unvotedCount,
      total: safeTotalCount,
      easyOptions: safeEasyCount,
      difficultOptions: safeDifficultCount,
      notExistOptions: safeNotExistCount
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
    const start = (page - 1) * pageSize
    const end = start + pageSize - 1

    // Build the query
    let query = supabase
      .from('votes')
      .select(`
        *,
        option:options(*)
      `)
      .eq('user_id', userId)

    // Apply search filter if provided
    if (searchQuery) {
      // First get the option IDs that match the search
      const { data: matchingOptions, error: optionError } = await supabase
        .from('options')
        .select('id')
        .ilike('option', `%${searchQuery}%`)

      if (optionError) throw optionError

      // Then filter votes by those option IDs
      if (matchingOptions && matchingOptions.length > 0) {
        const optionIds = matchingOptions.map(w => w.id)
        query = query.in('option_id', optionIds)
      } else {
        // If no matching options, return empty result
        return { votes: [], total: 0 }
      }
    }

    // Apply filter filter if not 'all'
    if (filterSelection !== 'all') {
      query = query.eq('filter', filterSelection)
    }

    // Get total count with the same filters
    let countQuery = supabase
      .from('votes')
      .select('*, option:options(*)', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (searchQuery) {
      // Use the same option IDs for the count query
      const { data: matchingOptions, error: optionError } = await supabase
        .from('options')
        .select('id')
        .ilike('option', `%${searchQuery}%`)

      if (optionError) throw optionError

      if (matchingOptions && matchingOptions.length > 0) {
        const optionIds = matchingOptions.map(w => w.id)
        countQuery = countQuery.in('option_id', optionIds)
      } else {
        return { votes: [], total: 0 }
      }
    }

    if (filterSelection !== 'all') {
      countQuery = countQuery.eq('filter', filterSelection)
    }

    const { count, error: countError } = await countQuery

    if (countError) throw countError

    // Get paginated results
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    return {
      votes: data || [],
      total: count || 0
    }
  } catch (error) {
    console.error('Error al obtener historial de votos:', error)
    throw error
  }
}
