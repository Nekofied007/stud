import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  askTutor,
  getTutorHistory,
  clearTutorHistory,
  submitTutorFeedback,
  getSuggestedQuestions,
  getSessionStats,
  generateSessionId
} from '../api/tutor'
import type {
  TutorResponse,
  TutorAskRequest,
  ConversationHistory,
  TutorFeedbackRequest,
  SessionStats
} from '../api/tutor'

/**
 * Hook to ask a question to the AI tutor
 * POST /api/v1/tutor/ask
 */
export const useAskTutor = () => {
  const queryClient = useQueryClient()

  return useMutation<TutorResponse, Error, TutorAskRequest>(
    (request) => askTutor(request),
    {
      onSuccess: (_, request) => {
        // Invalidate conversation history for this session
        if (request.session_id) {
          queryClient.invalidateQueries(['tutor-history', request.session_id])
        }
      },
      onError: (error) => {
        console.error('Failed to ask tutor:', error)
      }
    }
  )
}

/**
 * Hook to fetch conversation history
 * GET /api/v1/tutor/history/{session_id}
 */
export const useTutorHistory = (sessionId: string | undefined) => {
  return useQuery<ConversationHistory, Error>(
    ['tutor-history', sessionId],
    () => getTutorHistory(sessionId!),
    {
      enabled: !!sessionId,
      staleTime: 30 * 1000, // 30 seconds (conversations update frequently)
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch tutor history:', error)
      }
    }
  )
}

/**
 * Hook to clear conversation history
 * DELETE /api/v1/tutor/history/{session_id}
 */
export const useClearTutorHistory = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (sessionId: string) => clearTutorHistory(sessionId),
    {
      onSuccess: (_, sessionId) => {
        // Invalidate history for this session
        queryClient.invalidateQueries(['tutor-history', sessionId])
      },
      onError: (error: any) => {
        console.error('Failed to clear tutor history:', error)
      }
    }
  )
}

/**
 * Hook to submit feedback for a tutor response
 * POST /api/v1/tutor/feedback
 */
export const useSubmitTutorFeedback = () => {
  return useMutation<{ message: string }, Error, TutorFeedbackRequest>(
    (feedback) => submitTutorFeedback(feedback),
    {
      onSuccess: () => {
        console.log('Feedback submitted successfully')
      },
      onError: (error) => {
        console.error('Failed to submit feedback:', error)
      }
    }
  )
}

/**
 * Hook to fetch suggested questions for a video
 * GET /api/v1/tutor/suggest/{video_id}
 */
export const useSuggestedQuestions = (videoId: string | undefined) => {
  return useQuery<{ questions: string[] }, Error>(
    ['suggested-questions', videoId],
    () => getSuggestedQuestions(videoId!),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch suggested questions:', error)
      }
    }
  )
}

/**
 * Hook to fetch session statistics
 * GET /api/v1/tutor/stats/{session_id}
 */
export const useSessionStats = (sessionId: string | undefined) => {
  return useQuery<SessionStats, Error>(
    ['session-stats', sessionId],
    () => getSessionStats(sessionId!),
    {
      enabled: !!sessionId,
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch session stats:', error)
      }
    }
  )
}

/**
 * Custom hook to manage tutor session ID
 * Stores session ID in localStorage for persistence
 */
export const useTutorSession = (videoId?: string) => {
  const storageKey = videoId ? `tutor-session-${videoId}` : 'tutor-session-global'

  const getSessionId = (): string => {
    const stored = localStorage.getItem(storageKey)
    if (stored) return stored

    const newId = generateSessionId()
    localStorage.setItem(storageKey, newId)
    return newId
  }

  const clearSession = () => {
    localStorage.removeItem(storageKey)
  }

  return {
    sessionId: getSessionId(),
    clearSession
  }
}
