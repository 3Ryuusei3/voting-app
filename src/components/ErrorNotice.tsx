import React from 'react'

interface ErrorNoticeProps {
  message: string
  className?: string
}

export const ErrorNotice: React.FC<ErrorNoticeProps> = ({
  message,
  className = "mb-6 max-w-md mx-auto"
}) => {
  if (!message) return null

  return (
    <div className={`alert alert-error ${className}`}>
      <p>{message}</p>
    </div>
  )
}
