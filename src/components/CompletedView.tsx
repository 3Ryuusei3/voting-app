import React from 'react'
import { useNavigate } from 'react-router-dom'
import OptionStats from './OptionStats'

interface CompletedViewProps {
  optionCounts: {
    voted: number
    unvoted: number
    total: number
    easyOptions: number
    difficultOptions: number
    notExistOptions: number
  }
}

export const CompletedView: React.FC<CompletedViewProps> = ({ optionCounts }) => {
  const navigate = useNavigate()

  return (
    <div className="container">
      <div className="card max-w-md w-full mx-auto">
        <div className="card-body gap-md text-center">
          <h2 className="text-xl font-medium mb-4">¡Has votado todas las palabras disponibles!</h2>
          <p className="text-muted mb-6">Vuelve más tarde para votar nuevas palabras.</p>
          <div className="mb-6">
            <p className="font-medium mb-2">Estadísticas:</p>
            <OptionStats optionCounts={optionCounts} />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}
