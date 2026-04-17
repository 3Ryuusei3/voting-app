import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { getUserPolls, type PollWithPermission } from '../lib/pollsService'
import OptionStats from './OptionStats'
import AddTermModal from './AddTermModal'

const isSuperadminRole = (role: number | null) => role === 1 || role === Number('1')

const AuthenticatedContent = () => {
  const { user, userRole } = useAuth()
  const [polls, setPolls] = useState<PollWithPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddTermOpen, setIsAddTermOpen] = useState(false)
  const [addTermPollId, setAddTermPollId] = useState<number | undefined>(undefined)

  const isSuperadmin = isSuperadminRole(userRole)

  const openAddTermForPoll = (pollId: number) => {
    setAddTermPollId(pollId)
    setIsAddTermOpen(true)
  }

  const closeAddTermModal = () => {
    setIsAddTermOpen(false)
    setAddTermPollId(undefined)
  }

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
                        <div className="flex flex-col gap-sm">
                          <div className="flex gap-sm bp-sm">
                            <Link to={`/history?pollId=${poll.id}`} className="btn btn-xs btn-secondary w-100">
                              Ver listado de votos
                            </Link>
                            {poll.optionCounts.unvoted > 0 && (
                              <Link to={`/vote?pollId=${poll.id}`} className="btn btn-xs btn-primary w-100">
                                Comenzar a votar
                              </Link>
                            )}
                          </div>
                          {isSuperadmin && (
                            <div className="flex gap-sm bp-sm">
                              <button
                                type="button"
                                className="btn btn-xs btn-primary w-100"
                                onClick={() => openAddTermForPoll(poll.id)}
                              >
                                Nueva palabra
                              </button>
                              <Link to={`/admin?pollId=${poll.id}`} className="btn btn-xs btn-secondary w-100">
                                Listado
                              </Link>
                            </div>
                          )}
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

      {isSuperadmin && (
        <AddTermModal
          isOpen={isAddTermOpen}
          onClose={closeAddTermModal}
          initialPollId={addTermPollId}
        />
      )}
    </div>
  )
}

export default AuthenticatedContent
