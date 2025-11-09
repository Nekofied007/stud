import { useMutation, useQuery, useQueryClient } from 'react-query'
import {
  generateQuiz,
  getQuizStatus,
  getQuiz,
  submitQuizAnswer,
  validateQuiz,
  reviewQuizQuestion
} from '../api/quiz'
import type { QuizData, QuizStatus, QuizSubmitResponse } from '../api/quiz'

/**
 * Hook to generate quiz for a video
 * POST /api/v1/quiz/video/{video_id}
 */
export const useGenerateQuiz = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (videoId: string) => generateQuiz(videoId),
    {
      onSuccess: (_, videoId) => {
        // Invalidate quiz status and quiz data
        queryClient.invalidateQueries(['quiz-status', videoId])
        queryClient.invalidateQueries(['quiz', videoId])
      },
      onError: (error: any) => {
        console.error('Failed to generate quiz:', error)
      }
    }
  )
}

/**
 * Hook to fetch quiz status
 * GET /api/v1/quiz/status/{video_id}
 * 
 * @param videoId - Video ID
 * @param refetchInterval - Auto-refetch interval in ms (default: 5000 for 'generating', null otherwise)
 */
export const useQuizStatus = (
  videoId: string | undefined,
  refetchInterval?: number | false
) => {
  return useQuery<QuizStatus, Error>(
    ['quiz-status', videoId],
    () => getQuizStatus(videoId!),
    {
      enabled: !!videoId,
      staleTime: 0, // Always fetch fresh status
      retry: 2,
      refetchInterval: refetchInterval !== undefined
        ? refetchInterval
        : ((data) => data?.status === 'generating' ? 5000 : false), // Auto-refetch every 5s if generating
      onError: (error) => {
        console.error('Failed to fetch quiz status:', error)
      }
    }
  )
}

/**
 * Hook to fetch quiz data
 * GET /api/v1/quiz/video/{video_id}
 * 
 * @param videoId - Video ID
 * @param includeAnswers - Include correct answers (for instructors)
 */
export const useQuiz = (videoId: string | undefined, includeAnswers: boolean = false) => {
  return useQuery<QuizData, Error>(
    ['quiz', videoId, includeAnswers],
    () => getQuiz(videoId!, includeAnswers),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch quiz:', error)
      }
    }
  )
}

/**
 * Hook to submit quiz answer
 * POST /api/v1/quiz/video/{video_id}/question/{question_id}/submit
 */
export const useSubmitQuizAnswer = () => {
  return useMutation<
    QuizSubmitResponse,
    Error,
    { videoId: string; questionId: string; selectedAnswer: number }
  >(
    ({ videoId, questionId, selectedAnswer }) =>
      submitQuizAnswer(videoId, questionId, selectedAnswer),
    {
      onSuccess: (data) => {
        console.log('Answer submitted:', data)
      },
      onError: (error) => {
        console.error('Failed to submit answer:', error)
      }
    }
  )
}

/**
 * Hook to validate quiz quality
 * POST /api/v1/quiz/video/{video_id}/validate
 */
export const useValidateQuiz = () => {
  return useMutation(
    (videoId: string) => validateQuiz(videoId),
    {
      onError: (error: any) => {
        console.error('Failed to validate quiz:', error)
      }
    }
  )
}

/**
 * Hook to review quiz question (instructor only)
 * PUT /api/v1/quiz/video/{video_id}/question/{question_id}/review
 */
export const useReviewQuizQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation<
    { message: string },
    Error,
    { videoId: string; questionId: string; approved: boolean; notes?: string }
  >(
    ({ videoId, questionId, approved, notes }) =>
      reviewQuizQuestion(videoId, questionId, approved, notes),
    {
      onSuccess: (_, { videoId }) => {
        // Invalidate quiz data to refetch
        queryClient.invalidateQueries(['quiz', videoId])
      },
      onError: (error) => {
        console.error('Failed to review question:', error)
      }
    }
  )
}
