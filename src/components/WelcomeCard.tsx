import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { getUserPolls, type PollWithPermission } from '../lib/pollsService'
import OptionStats from './OptionStats'

const AuthenticatedContent = () => {
  const { user } = useAuth()
  const [polls, setPolls] = useState<PollWithPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const pollsData = await getUserPolls(user.id)
      setPolls(pollsData)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="card">
      <div className="card-body gap-md">
        <h2 className="text-large font-medium">¡Hola, {user?.identities?.[0]?.identity_data?.full_name?.split(' ')[0] ?? user.email}!</h2>
        <p className="text-muted text-small text-italic">🎶 Yo quiero votar, ¡toda la noche!<br/>🎶 Vota, vota, votando, vo. Vota, vota, votando, ¡hey!</p>
        {!isLoading && (
          <>
            {polls.length > 0 && (
              <div className="">
                <h4 className="mt-sm mb-sm">Tus encuestas</h4>
                <div className="flex flex-col gap-sm">
                  {polls.map(poll => (
                    <div key={poll.id} className="card card__option">
                      <div className="card-body gap-sm">
                        <h4 className="font-medium">{poll.title}</h4>
                        {poll.description && (
                          <p className="card-info">{poll.description}</p>
                        )}
                        <OptionStats
                          optionCounts={poll.optionCounts}
                          showDetailedStats={false}
                          className="mt-4"
                        />
                        <div className="flex gap-sm bp-sm">
                          <Link to={`/history?pollId=${poll.id}`} className="btn btn-xs btn-secondary w-100">
                            Ver listado de votos
                          </Link>
                          <Link to={`/vote?pollId=${poll.id}`} className="btn btn-xs btn-primary w-100">
                            {poll.optionCounts.unvoted > 0 ? 'Comenzar a votar' : 'Ver estadísticas'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <p className="text-muted text-small text-right">© Manuel Atance 2025</p>
      </div>
    </div>
  )
}

export default AuthenticatedContent
