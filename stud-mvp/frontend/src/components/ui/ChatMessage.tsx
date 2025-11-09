import React from 'react'

interface Source {
  timestamp: string
  text: string
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  confidence?: number
  onSourceClick?: (timestamp: string) => void
  className?: string
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  role,
  content,
  sources,
  confidence,
  onSourceClick,
  className = ''
}) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-3xl ${role === 'user' ? 'ml-12' : 'mr-12'}`}>
        {/* Message Bubble */}
        <div className={`rounded-lg p-4 ${
          role === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>

        {/* Assistant-specific content */}
        {role === 'assistant' && (
          <>
            {/* Confidence Score */}
            {confidence !== undefined && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <span>Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all" 
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span>{Math.round(confidence * 100)}%</span>
              </div>
            )}

            {/* Sources */}
            {sources && sources.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-gray-600">Sources:</p>
                {sources.map((source, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSourceClick?.(source.timestamp)}
                    className="block w-full text-left text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-semibold text-indigo-600">
                      🎬 {source.timestamp}
                    </span>
                    <p className="text-gray-700 mt-1 line-clamp-2">{source.text}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ChatMessage
