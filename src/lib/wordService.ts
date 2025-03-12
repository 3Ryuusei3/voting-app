import { supabase } from './supabase'
import type { Word, Vote } from '../types'

/**
 * Obtiene palabras que el usuario aún no ha votado
 */
export async function getUnvotedWords(userId: string, limit = 10): Promise<Word[]> {
  try {
    // Obtener todas las palabras
    const { data: allWords, error: wordsError } = await supabase
      .from('words')
      .select('*')
      .order('created_at')
      .limit(500) // Limitamos a 500 para no sobrecargar

    if (wordsError) {
      console.error('Error al obtener palabras:', wordsError)
      throw wordsError
    }

    // Obtener palabras ya votadas
    const { data: votedWords, error: votedError } = await supabase
      .from('votes')
      .select('word_id')
      .eq('user_id', userId)

    if (votedError) {
      console.error('Error al obtener votos:', votedError)
      throw votedError
    }

    // Crear un Set de IDs votados para búsqueda eficiente
    const votedIdsSet = new Set((votedWords || []).map(v => v.word_id))

    // Filtrar palabras no votadas en el cliente
    const unvotedWords = (allWords || []).filter(word => !votedIdsSet.has(word.id))

    // Devolver solo la cantidad solicitada
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
