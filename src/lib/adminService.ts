import { supabase } from './supabase'

export interface AdminVoteRow {
  vote_id: number
  user_id: string
  user_email: string
  user_name: string | null
  option_id: number
  option_text: string
  filter: 'easy' | 'difficult' | 'not_exist'
  created_at: string
}

interface RawAdminVoteRow {
  vote_id: number | string
  user_id: string
  user_email: string | null
  user_name: string | null
  option_id: number | string
  option_text: string
  filter: 'easy' | 'difficult' | 'not_exist'
  created_at: string
}

/**
 * Busca todos los votos de todos los usuarios para las palabras que coincidan
 * con la consulta, dentro de una encuesta. Solo accesible para superadmins.
 */
export async function adminSearchVotesByWord(
  pollId: number,
  searchQuery: string,
  exactWordMatch: boolean = false
): Promise<AdminVoteRow[]> {
  const trimmed = searchQuery.trim()
  if (!trimmed) return []

  const rpcArgs: Record<string, string | number | boolean> = {
    p_poll_id: pollId,
    p_search_query: trimmed
  }
  if (exactWordMatch) {
    rpcArgs.p_exact_match = true
  }

  const { data, error } = await supabase
    .rpc('admin_search_votes_by_word', rpcArgs) as { data: RawAdminVoteRow[] | null; error: Error | null }

  if (error) {
    console.error('Error al buscar votos (admin):', error)
    throw error
  }

  if (!data) return []

  return data.map(row => ({
    vote_id: Number(row.vote_id),
    user_id: row.user_id,
    user_email: row.user_email ?? '',
    user_name: row.user_name ?? null,
    option_id: Number(row.option_id),
    option_text: row.option_text,
    filter: row.filter,
    created_at: row.created_at
  }))
}

/**
 * Actualiza el voto de un usuario concreto. Solo accesible para superadmins.
 */
export async function adminUpdateUserVote(
  voteId: number,
  filter: 'easy' | 'difficult' | 'not_exist'
): Promise<void> {
  const { error } = await supabase.rpc('admin_update_user_vote', {
    p_vote_id: voteId,
    p_filter: filter
  })

  if (error) {
    console.error('Error al actualizar voto (admin):', error)
    throw error
  }
}
