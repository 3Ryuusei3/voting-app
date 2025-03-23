import React from 'react'

interface LoadingViewProps {
  message?: string
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = "Cargando palabras..."
}) => {
  return (
    <div className="flex items-center justify-center">
      <p className="text-muted text-large">{message}</p>
    </div>
  )
}
