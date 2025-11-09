import apiClient from './client'

// Types for AI tutor
export interface TutorSource {
  chunk_id: string
  text: string
  timestamp: string // "MM:SS" or "HH:MM:SS"
  similarity_score: number
}

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface TutorResponse {
  answer: string
  sources: TutorSource[]
  confidence: number // 0-1
  suggested_questions: string[]
  session_id: string
  timestamp: string
}

export interface TutorAskRequest {
  question: string
  video_id?: string
  session_id?: string
  top_k?: number // Default: 5
  context_window?: number // Default: 3
}

export interface ConversationHistory {
  session_id: string
  video_id?: string
  messages: TutorMessage[]
  created_at: string
  updated_at: string
}

export interface TutorFeedbackRequest {
  session_id: string
  message_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
}

export interface SessionStats {
  session_id: string
  total_questions: number
  average_confidence: number
  topics_discussed: string[]
  duration_minutes: number
}

// API functions for AI tutor

/**
 * Ask a question to the AI tutor
 * POST /api/v1/tutor/ask
 */
export const askTutor = async (request: TutorAskRequest): Promise<TutorResponse> => {
  const response = await apiClient.post<TutorResponse>('/api/v1/tutor/ask', request)
  return response.data
}

/**
 * Get conversation history for a session
 * GET /api/v1/tutor/history/{session_id}
 */
export const getTutorHistory = async (sessionId: string): Promise<ConversationHistory> => {
  const response = await apiClient.get<ConversationHistory>(`/api/v1/tutor/history/${sessionId}`)
  return response.data
}

/**
 * Clear conversation history
 * DELETE /api/v1/tutor/history/{session_id}
 */
export const clearTutorHistory = async (sessionId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>(
    `/api/v1/tutor/history/${sessionId}`
  )
  return response.data
}

/**
 * Submit feedback for a tutor response
 * POST /api/v1/tutor/feedback
 */
export const submitTutorFeedback = async (
  feedback: TutorFeedbackRequest
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/api/v1/tutor/feedback', feedback)
  return response.data
}

/**
 * Get suggested questions for a video
 * GET /api/v1/tutor/suggest/{video_id}
 */
export const getSuggestedQuestions = async (videoId: string): Promise<{ questions: string[] }> => {
  const response = await apiClient.get<{ questions: string[] }>(
    `/api/v1/tutor/suggest/${videoId}`
  )
  return response.data
}

/**
 * Get session statistics
 * GET /api/v1/tutor/stats/{session_id}
 */
export const getSessionStats = async (sessionId: string): Promise<SessionStats> => {
  const response = await apiClient.get<SessionStats>(`/api/v1/tutor/stats/${sessionId}`)
  return response.data
}

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}
