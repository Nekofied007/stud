import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { 
  useAskTutor, 
  useTutorHistory, 
  useClearTutorHistory, 
  useTutorSession,
  useSuggestedQuestions 
} from '../hooks'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ timestamp: string; text: string }>
  confidence?: number
}

const TutorPage: React.FC = () => {
  const { sessionId: sessionParam } = useParams<{ sessionId?: string }>()
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('video') || ''

  // Tutor session and data hooks
  const { sessionId, clearSession } = useTutorSession(videoId)
  const { data: history, isLoading: historyLoading } = useTutorHistory(sessionParam || sessionId)
  const { data: suggestions } = useSuggestedQuestions(videoId)
  
  // Mutations
  const askMutation = useAskTutor()
  const clearMutation = useClearTutorHistory()
  
  // Local state
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')

  // Sync messages from history
  useEffect(() => {
    if (history?.messages) {
      setMessages(history.messages)
    }
  }, [history])

  const loading = askMutation.isLoading

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear the conversation history?')) {
      return
    }
    
    try {
      await clearMutation.mutateAsync(sessionParam || sessionId)
      clearSession()
      setMessages([])
    } catch (error) {
      console.error('Failed to clear history:', error)
      alert('Failed to clear history. Please try again.')
    }
  }

  const handleSendQuestion = async (questionText?: string) => {
    const messageText = questionText || question.trim()
    if (!messageText) return

    try {
      // Add user message immediately
      const userMessage: Message = { role: 'user', content: messageText }
      setMessages((prev: Message[]) => [...prev, userMessage])
      setQuestion('')

      // Send to API
      const response = await askMutation.mutateAsync({
        question: messageText,
        video_id: videoId,
        session_id: sessionParam || sessionId
      })

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources?.map(s => ({
          timestamp: s.timestamp,
          text: s.text
        })),
        confidence: response.confidence
      }
      setMessages((prev: Message[]) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }
      setMessages((prev: Message[]) => [...prev, errorMessage])
    }
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Tutor</h1>
            <p className="text-sm text-gray-600">
              {videoId ? `Context: Video ${videoId}` : 'Ask questions about any video'}
              {sessionId && ` • Session: ${sessionId}`}
            </p>
          </div>
          <button 
            onClick={handleClearHistory}
            disabled={clearMutation.isLoading || messages.length === 0}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {clearMutation.isLoading ? 'Clearing...' : 'Clear History'}
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-50 border-x border-gray-200 overflow-y-auto p-6 space-y-4">
        {historyLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading conversation...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hi! I'm your AI tutor
            </h3>
            <p className="text-gray-600 mb-6">
              Ask me anything about the video content and I'll help you understand it better
            </p>
            
            {/* Suggested Questions */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">Suggested questions:</p>
              <div className="grid gap-2">
                {suggestions && suggestions.length > 0 ? suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendQuestion(suggestion)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                )) : [
                  'Can you summarize the main points?',
                  'What are the key takeaways?'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendQuestion(suggestion)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                  {/* Message Bubble */}
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>

                  {/* Sources (for assistant messages) */}
                  {message.role === 'assistant' && message.sources && (
                    <div className="mt-2 space-y-2">
                      {message.sources.map((source, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // Navigate to lesson page with timestamp
                            // Format: /courses/PLAYLIST_ID/lessons/VIDEO_ID?t=TIMESTAMP
                            window.open(`/courses/unknown/lessons/${videoId}?t=${source.timestamp}`, '_blank')
                          }}
                          className="block w-full text-left text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 hover:bg-blue-100 transition-colors"
                        >
                          <span className="font-semibold text-indigo-600">
                            🎬 {source.timestamp}
                          </span>
                          <span className="text-gray-700 ml-2 line-clamp-1">{source.text}</span>
                        </button>
                      ))}
                      
                      {/* Confidence Score */}
                      {message.confidence && (
                        <div className="text-xs text-gray-600">
                          Confidence: {Math.round(message.confidence * 100)}%
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-3xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6 flex-shrink-0">
        <div className="flex space-x-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendQuestion()}
            placeholder="Ask a question about the video..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={() => handleSendQuestion()}
            disabled={loading || !question.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Answers are generated from video transcripts with timestamp citations
        </p>
      </div>
    </div>
  )
}

export default TutorPage
