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
    // Build the base query for words
    let query = supabase
      .from('words')
      .select('*')

    // Apply search filter if provided
    if (searchQuery) {
      query = query.ilike('word', `%${searchQuery}%`)
    }

    // Get total count of words matching the search
    const { count: totalCount, error: countError } = await supabase
      .from('words')
      .select('*', { count: 'exact', head: true })
      .ilike('word', `%${searchQuery}%`)

    if (countError) {
      console.error('Error al obtener conteo total de palabras:', countError)
      throw countError
    }

    // Get total count of voted words matching the search
    let votedQuery = supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (searchQuery) {
      // Get word IDs that match the search
      const { data: matchingWords, error: wordError } = await supabase
        .from('words')
        .select('id')
        .ilike('word', `%${searchQuery}%`)

      if (wordError) throw wordError

      if (matchingWords && matchingWords.length > 0) {
        const wordIds = matchingWords.map(w => w.id)
        votedQuery = votedQuery.in('word_id', wordIds)
      } else {
        return { words: [], total: 0 }
      }
    }

    const { count: votedCount, error: votedError } = await votedQuery

    if (votedError) {
      console.error('Error al obtener conteo de votos:', votedError)
      throw votedError
    }

    // Calculate total unvoted words
    const totalUnvoted = (totalCount || 0) - (votedCount || 0)

    // If no unvoted words, return empty result
    if (totalUnvoted <= 0) {
      return { words: [], total: 0 }
    }

    // Get a random offset to get different words each time
    const maxOffset = Math.max(0, totalUnvoted - (pageSize * 5))
    const randomOffset = Math.floor(Math.random() * maxOffset)

    // Get a batch of words
    const { data: randomWords, error: wordsError } = await query
      .order('word', { ascending: true })
      .range(randomOffset, randomOffset + (pageSize * 5) - 1)

    if (wordsError) {
      console.error('Error al obtener palabras aleatorias:', wordsError)
      throw wordsError
    }

    if (!randomWords || randomWords.length === 0) {
      return { words: [], total: 0 }
    }

    // Get the IDs of these random words
    const randomWordIds = randomWords.map(word => word.id)

    // Check which of these random words the user has already voted on
    const { data: votedWords, error: votedCheckError } = await supabase
      .from('votes')
      .select('word_id')
      .eq('user_id', userId)
      .in('word_id', randomWordIds)

    if (votedCheckError) {
      console.error('Error al obtener palabras votadas:', votedCheckError)
      throw votedCheckError
    }

    // Filter out words the user has already voted on
    const votedIdsSet = new Set((votedWords || []).map(v => v.word_id))
    const unvotedWords = randomWords.filter(word => !votedIdsSet.has(word.id))

    // If we don't have enough words after filtering, try again with a different batch
    if (unvotedWords.length < pageSize && randomWords.length >= pageSize * 2) {
      // Recursive call to try again with different random words
      return getUnvotedWords(userId, page, pageSize, searchQuery)
    }

    // Calculate pagination
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedWords = unvotedWords.slice(start, end)

    return {
      words: paginatedWords,
      total: totalUnvoted
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
