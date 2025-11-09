import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const CoursesPage: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('http://localhost:8000/api/v1/ingest/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: playlistUrl })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to ingest playlist')
      }

      setSuccess(true)
      setPlaylistUrl('')
      // TODO: Refresh course list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
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
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Paste the URL of any public YouTube playlist
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              Playlist imported successfully! Transcription will begin shortly.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Importing...' : 'Import Playlist'}
          </button>
        </form>
      </div>

      {/* Placeholder for Course List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Courses</h2>
        
        {/* TODO: Fetch and display actual courses */}
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-lg">No courses yet</p>
          <p className="text-sm">Import your first playlist to get started</p>
        </div>

        {/* Example course card (commented out) */}
        {/* 
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/courses/PLAYLIST_ID" className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200">
            <div className="aspect-video bg-gray-300 rounded-md mb-3"></div>
            <h3 className="font-semibold text-gray-900 mb-1">Course Title</h3>
            <p className="text-sm text-gray-600 mb-2">12 videos</p>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Transcribed</span>
            </div>
          </Link>
        </div>
        */}
      </div>
    </div>
  )
}

export default CoursesPage
