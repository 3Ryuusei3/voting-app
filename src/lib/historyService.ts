import { supabase } from './supabase'
import type { Option, Vote } from '../types'

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

interface UnvotedOptionResult {
  id: number
  option: string
  total: number
  created_at: string
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

    // El total viene en el primer registro
    const total = data[0].total || 0

    // Convertir los datos al formato Option
    const options: Option[] = data.map(item => ({
      id: item.id,
      option: item.option,
      created_at: item.created_at,
      poll_id: 1
    }))

    return {
      options,
      total
    }
  } catch (err) {
    console.error('Error en getUnvotedOptions:', err)
    throw err
  }
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
