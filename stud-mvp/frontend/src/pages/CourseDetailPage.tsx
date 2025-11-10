import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePlaylist } from '../hooks'

const CourseDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>()
  const { data: playlist, isLoading, isError } = usePlaylist(playlistId)

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/courses" className="hover:text-indigo-600">Courses</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Course Details</span>
      </nav>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : isError ? (
          <div className="text-red-600">
            <p className="font-semibold">Failed to load course</p>
            <p className="text-sm">Playlist ID: {playlistId}</p>
          </div>
        ) : playlist ? (
          <>
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {playlist.title}
              </h1>
              <p className="text-gray-600">
                {playlist.description || 'No description available'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                By {playlist.channel_title}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>🎥</span>
                <span>{playlist.video_count} video{playlist.video_count !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📋</span>
                <span>Playlist ID: {playlist.playlist_id}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">❌</div>
            <p className="text-lg">Failed to load lessons</p>
          </div>
        ) : playlist && playlist.videos && playlist.videos.length > 0 ? (
          <div className="space-y-3">
            {playlist.videos.map((video, index) => (
              <Link
                key={video.video_id}
                to={`/courses/${playlistId}/lessons/${video.video_id}`}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.duration}</p>
                </div>

                <div className="flex items-center space-x-2">
                  {video.thumbnail_url && (
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-lg">No lessons found</p>
            <p className="text-sm mt-2">
              This playlist may not be imported yet. Try importing it from the{' '}
              <Link to="/courses" className="text-indigo-600 hover:underline">Courses page</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetailPage
