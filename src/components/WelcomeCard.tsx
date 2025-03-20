import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { getOptionCounts } from '../lib/optionService'
import OptionStats from './OptionStats'

const AuthenticatedContent = () => {
  const { user } = useAuth()
  const [optionCounts, setOptionCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyOptions: 0,
    difficultOptions: 0,
    notExistOptions: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadOptionCounts()
    }
  }, [user])

  const loadOptionCounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const counts = await getOptionCounts(user.id)
      setOptionCounts(counts)
    } catch (err) {
      console.error('Error al cargar conteos de palabras:', err)
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
        <h2 className="text-large font-medium">¡Bienvenido, {user?.identities?.[0]?.identity_data?.full_name?.split(' ')[0] ?? user.email}!</h2>
        <p className="text-muted">En esta aplicación podrás votar para filtrar la lista de palabras del juego <Link to="https://wo-ses.vercel.app/" className="link">WOS-ES</Link>.</p>
        <p className="text-muted mb-4">
          En el juego se podrá elegir 2 modos con las palabras consideradas complicadas por los usuarios de Woses y las palabras que los usuarios han votado como fáciles.
        </p>

        {!isLoading && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h4 className="mt-sm mb-sm">Progreso</h4>

            <OptionStats
              optionCounts={optionCounts}
              showDetailedStats={false}
              className="mt-4"
            />
          </div>
        )}

        <div className="flex gap-sm bp-sm">
          <Link to="/history" className="btn btn-secondary   w-100">
            Ver listado de votos
          </Link>
          <Link to="/vote" className="btn btn-primary w-100">
            {optionCounts.unvoted > 0 ? 'Comenzar a votar' : 'Ver estadísticas'}
          </Link>
        </div>
        <p className="text-muted text-small text-right">© Manuel Atance 2025</p>
      </div>
    </div>
  )
}

export default AuthenticatedContent
