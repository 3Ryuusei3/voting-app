import { supabase } from './supabase'
import type { Word, Vote } from '../types'

/**
 * Obtiene el historial de votos del usuario con paginación
 */
export async function getVoteHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = '',
  difficultyFilter: 'all' | 'easy' | 'difficult' | 'not_exist' = 'all'
): Promise<{
  votes: (Vote & { word: Word })[]
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
        word:words(*)
      `)
      .eq('user_id', userId)

    // Apply search filter if provided
    if (searchQuery) {
      // First get the word IDs that match the search
      const { data: matchingWords, error: wordError } = await supabase
        .from('words')
        .select('id')
        .ilike('word', `%${searchQuery}%`)

      if (wordError) throw wordError

      // Then filter votes by those word IDs
      if (matchingWords && matchingWords.length > 0) {
        const wordIds = matchingWords.map(w => w.id)
        query = query.in('word_id', wordIds)
      } else {
        // If no matching words, return empty result
        return { votes: [], total: 0 }
      }
    }

    // Apply difficulty filter if not 'all'
    if (difficultyFilter !== 'all') {
      query = query.eq('difficult', difficultyFilter)
    }

    // Get total count with the same filters
    let countQuery = supabase
      .from('votes')
      .select('*, word:words(*)', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (searchQuery) {
      // Use the same word IDs for the count query
      const { data: matchingWords, error: wordError } = await supabase
        .from('words')
        .select('id')
        .ilike('word', `%${searchQuery}%`)

      if (wordError) throw wordError

      if (matchingWords && matchingWords.length > 0) {
        const wordIds = matchingWords.map(w => w.id)
        countQuery = countQuery.in('word_id', wordIds)
      } else {
        return { votes: [], total: 0 }
      }
    }

    if (difficultyFilter !== 'all') {
      countQuery = countQuery.eq('difficult', difficultyFilter)
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

interface UnvotedWordResult {
  id: number
  word: string
  total: number
  created_at: string
}

/**
 * Obtiene palabras que el usuario aún no ha votado
 */
export async function getUnvotedWords(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = ''
): Promise<{
  words: Word[]
  total: number
}> {
  try {
    const { data, error } = await supabase
      .rpc('get_unvoted_words', {
        p_user_id: userId,
        p_search_query: searchQuery,
        p_page: page,
        p_page_size: pageSize
      }) as { data: UnvotedWordResult[] | null, error: Error | null }

    if (error) {
      console.error('Error al obtener palabras no votadas:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return { words: [], total: 0 }
    }

    // El total viene en el primer registro
    const total = data[0].total || 0

    // Convertir los datos al formato Word
    const words: Word[] = data.map(item => ({
      id: item.id,
      word: item.word,
      created_at: item.created_at
    }))

    return {
      words,
      total
    }
  } catch (err) {
    console.error('Error en getUnvotedWords:', err)
    throw err
  }
}

/**
 * Actualiza un voto existente
 */
export async function updateVote(userId: string, wordId: number, difficult: 'easy' | 'difficult' | 'not_exist'): Promise<Vote> {
  const { data, error } = await supabase
    .from('votes')
    .update({ difficult })
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .select()
    .single()

  if (error) {
    console.error('Error al actualizar voto:', error)
    throw error
  }

  return data
}
