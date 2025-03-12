import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { getWordCounts } from '../lib/wordService'
import WordStats from './WordStats'

const AuthenticatedContent = () => {
  const { user } = useAuth()
  const [wordCounts, setWordCounts] = useState({
    voted: 0,
    unvoted: 0,
    total: 0,
    easyWords: 0,
    difficultWords: 0,
    notExistWords: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWordCounts()
    }
  }, [user])

  const loadWordCounts = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const counts = await getWordCounts(user.id)
      setWordCounts(counts)
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
      <div className="card-body">
        <h2 className="text-large font-medium">¡Bienvenido, {user?.identities?.[0]?.identity_data?.full_name?.split(' ')[0] ?? user.email}!</h2>
        <p className="text-muted">En esta aplicación podrás votar para filtrar la lista de palabras del juego <Link to="https://wo-ses.vercel.app/" className="link">WOS-ES</Link>.</p>
        <p className="text-muted mb-4">
          En el juego se podrá elegir 2 modos con las palabras consideradas complicadas por los usuarios de Woses y las palabras que los usuarios han votado como fáciles.
        </p>

        {!isLoading && (
          <div className="bg-blue-50 p-4 rounded-md mb-6">
            <h4 className="mt-sm mb-sm">Has votado {wordCounts.voted} de {wordCounts.total} palabras totales.</h4>

            <WordStats
              wordCounts={wordCounts}
              showDetailedStats={false}
              className="mt-4"
            />
          </div>
        )}

        <Link to="/vote" className="btn btn-primary">
          {wordCounts.unvoted > 0 ? 'Comenzar a votar' : 'Ver estadísticas'}
        </Link>
      </div>
    </div>
  )
}

export default AuthenticatedContent
