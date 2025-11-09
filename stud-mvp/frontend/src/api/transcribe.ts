import apiClient from './client'

// Types for transcription
export interface TranscriptSegment {
  id: number
  start: number
  end: number
  text: string
}

export interface TranscriptData {
  video_id: string
  language: string
  duration: number
  segments: TranscriptSegment[]
  full_text: string
  created_at?: string
}

export interface TranscriptionStatus {
  video_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: number
  error?: string
  created_at?: string
  completed_at?: string
}

export interface TranscribeRequest {
  video_id: string
}

// API functions for transcription

/**
 * Start transcription for a video (background task)
 * POST /api/v1/transcribe/video/{video_id}
 */
export const transcribeVideo = async (videoId: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `/api/v1/transcribe/video/${videoId}`
  )
  return response.data
}

/**
 * Get transcription status
 * GET /api/v1/transcribe/video/{video_id}/status
 */
export const getTranscriptionStatus = async (videoId: string): Promise<TranscriptionStatus> => {
  const response = await apiClient.get<TranscriptionStatus>(
    `/api/v1/transcribe/video/${videoId}/status`
  )
  return response.data
}

/**
 * Get completed transcript
 * GET /api/v1/transcribe/video/{video_id}
 */
export const getTranscript = async (videoId: string): Promise<TranscriptData> => {
  const response = await apiClient.get<TranscriptData>(`/api/v1/transcribe/video/${videoId}`)
  return response.data
}

/**
 * Format timestamp (seconds) to MM:SS or HH:MM:SS
 */
export const formatTimestamp = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
