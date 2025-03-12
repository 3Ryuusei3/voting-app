import { supabase } from './supabase'
import type { Word, Vote } from '../types'

/**
 * Obtiene palabras que el usuario aún no ha votado
 */
export async function getUnvotedWords(userId: string, limit = 10): Promise<Word[]> {
  try {
    // First, check if we can get the total count of words the user has voted on
    const { count: votedCount, error: countError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (countError) {
      console.error('Error al obtener conteo de votos:', countError)
      throw countError
    }

    // If the user hasn't voted on any words yet, just get the first batch of words
    if (!votedCount || votedCount === 0) {
      const { data: words, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .order('created_at')
        .limit(limit)

      if (wordsError) {
        console.error('Error al obtener palabras:', wordsError)
        throw wordsError
      }

      return words || []
    }

    // Instead of getting all voted words at once, we'll use a more efficient approach
    // We'll get a random sample of words and filter out the ones the user has already voted on

    // Get a random sample of words (5x the limit to ensure we have enough after filtering)
    // Use a random offset to get different words each time
    const totalWords = await getTotalWordCount();
    const randomOffset = Math.floor(Math.random() * Math.max(1, totalWords - (limit * 5)));

    const { data: randomWords, error: randomError } = await supabase
      .from('words')
      .select('*')
      .range(randomOffset, randomOffset + (limit * 5) - 1)

    if (randomError) {
      console.error('Error al obtener palabras aleatorias:', randomError)
      throw randomError
    }

    if (!randomWords || randomWords.length === 0) {
      return []
    }

    // Get the IDs of these random words
    const randomWordIds = randomWords.map(word => word.id)

    // Check which of these random words the user has already voted on
    const { data: votedWords, error: votedError } = await supabase
      .from('votes')
      .select('word_id')
      .eq('user_id', userId)
      .in('word_id', randomWordIds) // Only check the random words we fetched

    if (votedError) {
      console.error('Error al obtener palabras votadas:', votedError)
      throw votedError
    }

    // Filter out words the user has already voted on
    const votedIdsSet = new Set((votedWords || []).map(v => v.word_id))
    const unvotedWords = randomWords.filter(word => !votedIdsSet.has(word.id))

    // If we don't have enough words after filtering, try again with a different batch
    if (unvotedWords.length < Math.min(limit, 5) && randomWords.length >= limit * 2) {
      // Recursive call to try again with different random words
      return getUnvotedWords(userId, limit)
    }

    return unvotedWords.slice(0, limit)
  } catch (err) {
    console.error('Error en getUnvotedWords:', err)
    throw err
  }
}

/**
 * Obtiene el conteo de palabras votadas y no votadas
 */
export async function getWordCounts(userId: string): Promise<{
  voted: number,
  unvoted: number,
  total: number,
  easyWords: number,
  difficultWords: number,
  notExistWords: number
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
      .eq('difficult', 'easy')

    if (easyError) throw easyError

    // Obtener conteo de palabras marcadas como difíciles
    const { count: difficultCount, error: difficultError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('difficult', 'difficult')

    if (difficultError) throw difficultError

    // Obtener conteo de palabras marcadas como no existentes
    const { count: notExistCount, error: notExistError } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('difficult', 'not_exist')

    if (notExistError) throw notExistError

    // Obtener conteo total de palabras
    const { count: totalCount, error: totalError } = await supabase
      .from('words')
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
      easyWords: safeEasyCount,
      difficultWords: safeDifficultCount,
      notExistWords: safeNotExistCount
    }
  } catch (error) {
    console.error('Error al obtener conteos de palabras:', error)
    throw error
  }
}

/**
 * Registra un voto del usuario
 */
export async function submitVote(userId: string, wordId: number, difficult: 'easy' | 'difficult' | 'not_exist'): Promise<Vote> {
  // Verificar si el usuario ya ha votado esta palabra
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('word_id', wordId)
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
        word_id: wordId,
        difficult: difficult,
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
 * Helper function to get the total count of words in the database
 */
async function getTotalWordCount(): Promise<number> {
  const { count, error } = await supabase
    .from('words')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error al obtener conteo total de palabras:', error)
    return 30000 // Fallback to a reasonable default
  }

  return count || 30000
}
