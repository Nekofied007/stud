import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ingestPlaylist, getPlaylist, listPlaylists, getVideo } from '../api/ingest'
import type { PlaylistData, VideoMetadata } from '../api/ingest'

/**
 * Hook to ingest a YouTube playlist
 * POST /api/v1/ingest/playlist
 */
export const useIngestPlaylist = () => {
  const queryClient = useQueryClient()

  return useMutation(
    (url: string) => ingestPlaylist(url),
    {
      onSuccess: (data) => {
        // Invalidate playlists list to refetch
        queryClient.invalidateQueries('playlists')
        queryClient.invalidateQueries(['playlist', data.playlist_id])
      },
      onError: (error: any) => {
        console.error('Failed to ingest playlist:', error)
      }
    }
  )
}

/**
 * Hook to fetch playlist metadata
 * GET /api/v1/ingest/playlist/{playlist_id}
 */
export const usePlaylist = (playlistId: string | undefined) => {
  return useQuery<PlaylistData, Error>(
    ['playlist', playlistId],
    () => getPlaylist(playlistId!),
    {
      enabled: !!playlistId, // Only run if playlistId is provided
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch playlist:', error)
      }
    }
  )
}

/**
 * Hook to list all playlists
 * GET /api/v1/ingest/playlists
 */
export const usePlaylists = () => {
  return useQuery<PlaylistData[], Error>(
    'playlists',
    listPlaylists,
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch playlists:', error)
      }
    }
  )
}

/**
 * Hook to fetch video metadata
 * GET /api/v1/ingest/video/{video_id}
 */
export const useVideo = (videoId: string | undefined) => {
  return useQuery<VideoMetadata, Error>(
    ['video', videoId],
    () => getVideo(videoId!),
    {
      enabled: !!videoId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      onError: (error) => {
        console.error('Failed to fetch video:', error)
      }
    }
  )
}
