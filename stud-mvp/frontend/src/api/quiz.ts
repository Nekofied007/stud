import apiClient from './client'

// Types for quiz
export interface QuizOption {
  option: string
  is_correct: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[] // Array of 4 option strings
  correct_answer: number // Index (0-3)
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  timestamp_reference: string // "MM:SS" or "HH:MM:SS"
  source_text?: string
}

export interface QuizData {
  video_id: string
  title: string
  questions: QuizQuestion[]
  total_questions: number
  requires_review: boolean
  created_at?: string
}

export interface QuizStatus {
  video_id: string
  status: 'not_started' | 'generating' | 'ready' | 'failed'
  progress?: number
  error?: string
}

export interface QuizSubmitRequest {
  selected_answer: number
}

export interface QuizSubmitResponse {
  correct: boolean
  correct_answer: number
  explanation: string
  timestamp_reference: string
  score?: number
}

// API functions for quiz

/**
 * Generate quiz for a video (background task)
 * POST /api/v1/quiz/video/{video_id}
 */
export const generateQuiz = async (videoId: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/api/v1/quiz/video/${videoId}`)
  return response.data
}

/**
 * Get quiz status
 * GET /api/v1/quiz/status/{video_id}
 */
export const getQuizStatus = async (videoId: string): Promise<QuizStatus> => {
  const response = await apiClient.get<QuizStatus>(`/api/v1/quiz/status/${videoId}`)
  return response.data
}

/**
 * Get quiz for a video
 * GET /api/v1/quiz/video/{video_id}
 * @param includeAnswers - Include correct answers (for instructors)
 */
export const getQuiz = async (
  videoId: string,
  includeAnswers: boolean = false
): Promise<QuizData> => {
  const response = await apiClient.get<QuizData>(`/api/v1/quiz/video/${videoId}`, {
    params: { include_answers: includeAnswers }
  })
  return response.data
}

/**
 * Submit answer for a quiz question
 * POST /api/v1/quiz/video/{video_id}/question/{question_id}/submit
 */
export const submitQuizAnswer = async (
  videoId: string,
  questionId: string,
  selectedAnswer: number
): Promise<QuizSubmitResponse> => {
  const response = await apiClient.post<QuizSubmitResponse>(
    `/api/v1/quiz/video/${videoId}/question/${questionId}/submit`,
    { selected_answer: selectedAnswer }
  )
  return response.data
}

/**
 * Validate quiz quality
 * POST /api/v1/quiz/video/{video_id}/validate
 */
export const validateQuiz = async (videoId: string): Promise<{ valid: boolean; issues: string[] }> => {
  const response = await apiClient.post<{ valid: boolean; issues: string[] }>(
    `/api/v1/quiz/video/${videoId}/validate`
  )
  return response.data
}

/**
 * Review quiz question (instructor only)
 * PUT /api/v1/quiz/video/{video_id}/question/{question_id}/review
 */
export const reviewQuizQuestion = async (
  videoId: string,
  questionId: string,
  approved: boolean,
  notes?: string
): Promise<{ message: string }> => {
  const response = await apiClient.put<{ message: string }>(
    `/api/v1/quiz/video/${videoId}/question/${questionId}/review`,
    { approved, notes }
  )
  return response.data
}
