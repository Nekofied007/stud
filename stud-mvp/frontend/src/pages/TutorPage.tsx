import React, { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{ timestamp: string; text: string }>
  confidence?: number
}

const TutorPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>()
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('video')

  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendQuestion = async () => {
    if (!question.trim()) return

    const userMessage: Message = { role: 'user', content: question }
    setMessages(prev => [...prev, userMessage])
    setQuestion('')
    setLoading(true)

    try {
      // TODO: Send question to API
      // POST /api/v1/tutor/ask with { question, video_id, session_id }

      // Mock response
      const assistantMessage: Message = {
        role: 'assistant',
        content: 'This is a sample response from the AI tutor. The actual response will be fetched from the API.',
        sources: [
          { timestamp: '1:23', text: 'Relevant context from video...' }
        ],
        confidence: 0.85
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send question:', error)
    } finally {
      setLoading(false)
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
          <button className="text-sm text-red-600 hover:text-red-700 font-medium">
            Clear History
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-gray-50 border-x border-gray-200 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
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
                {[
                  'Can you summarize the main points?',
                  'What are the key takeaways?',
                  'Explain the concept mentioned at 5:30'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
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
                          className="block w-full text-left text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2 hover:bg-blue-100 transition-colors"
                        >
                          <span className="font-semibold text-indigo-600">
                            🎬 {source.timestamp}
                          </span>
                          <span className="text-gray-700 ml-2">{source.text}</span>
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
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
            placeholder="Ask a question about the video..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={handleSendQuestion}
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
