import { useMutation, useQuery, useQueryClient } from 'react-query'
import { transcribeVideo, getTranscriptionStatus, getTranscript } from '../api/transcribe'
import type { TranscriptData, TranscriptionStatus } from '../api/transcribe'

/**
 * Hook to start video transcription
 * POST /api/v1/transcribe/video/{video_id}
 */
export const useTranscribeVideo = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (videoId: string) => transcribeVideo(videoId),
    {
      onSuccess: (_, videoId) => {
        // Invalidate transcription status and transcript
        queryClient.invalidateQueries(['transcription-status', videoId])
        queryClient.invalidateQueries(['transcript', videoId])
      },
      onError: (error: any) => {
        console.error('Failed to start transcription:', error)
      }
    }
  )
}

/**
 * Hook to fetch transcription status
 * GET /api/v1/transcribe/video/{video_id}/status
 * 
 * @param videoId - Video ID
 * @param refetchInterval - Auto-refetch interval in ms (default: 5000 for 'processing', null otherwise)
 */
export const useTranscriptionStatus = (
  videoId: string | undefined,
  refetchInterval?: number | false
) => {
  return useQuery<TranscriptionStatus, Error>(
    ['transcription-status', videoId],
    () => getTranscriptionStatus(videoId!),
    {
      enabled: !!videoId,
      staleTime: 0, // Always fetch fresh status
      retry: 2,
      refetchInterval: refetchInterval !== undefined 
        ? refetchInterval 
        : ((data) => data?.status === 'processing' ? 5000 : false), // Auto-refetch every 5s if processing
      onError: (error) => {
        console.error('Failed to fetch transcription status:', error)
      }
    }
  )
}

/**
 * Hook to fetch completed transcript
 * GET /api/v1/transcribe/video/{video_id}
 */
export const useTranscript = (videoId: string | undefined) => {
  return useQuery<TranscriptData, Error>(
    ['transcript', videoId],
    () => getTranscript(videoId!),
    {
      enabled: !!videoId,
      staleTime: 10 * 60 * 1000, // 10 minutes (transcripts don't change often)
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch transcript:', error)
      }
    }
  )
}
