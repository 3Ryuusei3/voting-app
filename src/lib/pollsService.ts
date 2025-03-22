import { supabase } from './supabase'

export interface PollWithPermission {
  id: number
  title: string
  description: string | null
  can_vote: boolean
  can_view: boolean
  optionCounts: {
    voted: number
    unvoted: number
    total: number
  }
}

/**
 * Obtiene las encuestas a las que tiene acceso el usuario
 */
export async function getUserPolls(userId: string): Promise<PollWithPermission[]> {
  try {
    // Primero obtenemos los permisos
    const { data: permissionsData, error: permissionsError } = await supabase
      .from('permissions')
      .select('poll_id, can_vote, can_view')
      .eq('user_id', userId)

    if (permissionsError) {
      console.error('Error al obtener permisos:', permissionsError)
      throw permissionsError
    }

    if (!permissionsData || permissionsData.length === 0) {
      return []
    }

    // Luego obtenemos las encuestas correspondientes
    const pollIds = permissionsData.map(p => p.poll_id)
    const { data: pollsData, error: pollsError } = await supabase
      .from('polls')
      .select('id, name, description')
      .in('id', pollIds)

    if (pollsError) {
      console.error('Error al obtener encuestas:', pollsError)
      throw pollsError
    }

    // Combinamos los datos
    const pollsMap = new Map(pollsData?.map(poll => [poll.id, poll]) || [])

    // Obtenemos las estadísticas para cada encuesta
    const pollsWithStats = await Promise.all(
      permissionsData.map(async permission => {
        const poll = pollsMap.get(permission.poll_id)
        if (!poll) return null

        // Obtener estadísticas para esta encuesta específica
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_option_counts_by_poll_id', {
            p_user_id: userId,
            p_poll_id: poll.id
          })

        if (statsError) {
          console.error('Error al obtener estadísticas:', statsError)
          return null
        }

        return {
          id: poll.id,
          title: poll.name,
          description: poll.description,
          can_vote: permission.can_vote,
          can_view: permission.can_view,
          optionCounts: {
            voted: Number(statsData[0].voted_count) || 0,
            total: Number(statsData[0].total_count) || 0,
            unvoted: Number(statsData[0].total_count - statsData[0].voted_count) || 0
          }
        }
      })
    )

    return pollsWithStats.filter((poll): poll is PollWithPermission => poll !== null)
  } catch (error) {
    console.error('Error en getUserPolls:', error)
    throw error
  }
}
