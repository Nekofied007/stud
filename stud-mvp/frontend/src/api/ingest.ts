import apiClient from './client'

// Types for playlist ingestion
export interface PlaylistIngestRequest {
  url: string
}

export interface VideoMetadata {
  video_id: string
  title: string
  description: string
  thumbnail_url: string
  duration: string
  published_at: string
}

export interface PlaylistData {
  playlist_id: string
  title: string
  description: string
  channel_title: string
  video_count: number
  videos: VideoMetadata[]
  created_at?: string
}

export interface IngestResponse {
  message: string
  playlist_id: string
  video_count: number
}

// API functions for playlist ingestion

/**
 * Ingest a YouTube playlist by URL
 * POST /api/v1/ingest/playlist
 */
export const ingestPlaylist = async (url: string): Promise<IngestResponse> => {
  const response = await apiClient.post<IngestResponse>('/api/v1/ingest/playlist', { url })
  return response.data
}

/**
 * Get playlist metadata by ID
 * GET /api/v1/ingest/playlist/{playlist_id}
 */
export const getPlaylist = async (playlistId: string): Promise<PlaylistData> => {
  const response = await apiClient.get<PlaylistData>(`/api/v1/ingest/playlist/${playlistId}`)
  return response.data
}

/**
 * List all ingested playlists
 * GET /api/v1/ingest/playlists
 */
export const listPlaylists = async (): Promise<PlaylistData[]> => {
  // Note: This endpoint doesn't exist in backend yet, but we'll prepare for it
  // For now, return empty array
  try {
    const response = await apiClient.get<PlaylistData[]>('/api/v1/ingest/playlists')
    return response.data
  } catch (error) {
    console.warn('List playlists endpoint not implemented yet')
    return []
  }
}

/**
 * Get video metadata
 * GET /api/v1/ingest/video/{video_id}
 */
export const getVideo = async (videoId: string): Promise<VideoMetadata> => {
  const response = await apiClient.get<VideoMetadata>(`/api/v1/ingest/video/${videoId}`)
  return response.data
}
