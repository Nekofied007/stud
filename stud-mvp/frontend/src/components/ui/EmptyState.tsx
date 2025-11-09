import React from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon: string
  title: string
  message: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  className?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon,
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {actionLabel && (
        actionTo ? (
          <Link 
            to={actionTo}
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {actionLabel}
          </Link>
        ) : onAction ? (
          <button
            onClick={onAction}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {actionLabel}
          </button>
        ) : null
      )}
    </div>
  )
}

export default EmptyState
