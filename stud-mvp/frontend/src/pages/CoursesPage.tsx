import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIngestPlaylist, usePlaylists } from '../hooks'

const CoursesPage: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('')
  
  // React Query hooks
  const ingestMutation = useIngestPlaylist()
  const { data: playlists, isLoading: loadingPlaylists } = usePlaylists()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!playlistUrl.trim()) return

    try {
      await ingestMutation.mutateAsync(playlistUrl)
      setPlaylistUrl('')
    } catch (err: any) {
      console.error('Failed to ingest playlist:', err)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Courses</h1>
        <p className="text-lg text-gray-600">
          Import YouTube playlists and transform them into interactive courses
        </p>
      </div>

      {/* Add Playlist Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playlist-url" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Playlist URL
            </label>
            <input
              id="playlist-url"
              type="url"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={ingestMutation.isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste the URL of any public YouTube playlist
            </p>
          </div>

          {ingestMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {(ingestMutation.error as any)?.response?.data?.detail || 'Failed to import playlist'}
            </div>
          )}

          {ingestMutation.isSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              Playlist imported successfully! Transcription will begin shortly.
            </div>
          )}

          <button
            type="submit"
            disabled={ingestMutation.isLoading || !playlistUrl.trim()}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {ingestMutation.isLoading ? 'Importing...' : 'Import Playlist'}
          </button>
        </form>
      </div>

      {/* Course List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
        
        {loadingPlaylists ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-lg">Loading courses...</p>
          </div>
        ) : playlists && playlists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <Link
                key={playlist.playlist_id}
                to={`/courses/${playlist.playlist_id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
              >
                {playlist.videos?.[0]?.thumbnail_url && (
                  <img
                    src={playlist.videos[0].thumbnail_url}
                    alt={playlist.title}
                    className="w-full aspect-video object-cover rounded-md mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {playlist.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {playlist.video_count} video{playlist.video_count !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {playlist.channel_title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg">No courses yet</p>
            <p className="text-sm">Import your first playlist to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursesPage
