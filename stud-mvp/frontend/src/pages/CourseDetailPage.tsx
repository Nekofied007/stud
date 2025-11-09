import React from 'react'
import { useParams, Link } from 'react-router-dom'

const CourseDetailPage: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>()

  // TODO: Fetch playlist data from API
  // const { data: playlist, isLoading } = useQuery(['playlist', playlistId], ...)

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
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {/* TODO: Replace with actual playlist title */}
            Course Title (Playlist ID: {playlistId})
          </h1>
          <p className="text-gray-600">
            {/* TODO: Replace with actual description */}
            Course description will appear here once loaded from the API
          </p>
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <span>🎥</span>
            <span>0 videos</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>⏱️</span>
            <span>0h 0m</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>✅</span>
            <span>0% complete</span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
        
        {/* TODO: Fetch and display actual videos */}
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">🎬</div>
          <p className="text-lg">Loading lessons...</p>
          <p className="text-sm mt-2">
            If this persists, the playlist may not be imported yet. Try importing it from the{' '}
            <Link to="/courses" className="text-indigo-600 hover:underline">Courses page</Link>.
          </p>
        </div>

        {/* Example lesson card (commented out) */}
        {/*
        <div className="space-y-3">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.video_id}
              to={`/courses/${playlistId}/lessons/${lesson.video_id}`}
              className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{lesson.title}</h3>
                <p className="text-sm text-gray-600">{lesson.duration}</p>
              </div>

              <div className="flex items-center space-x-2">
                {lesson.transcribed && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Transcribed</span>
                )}
                {lesson.quiz_available && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Quiz Ready</span>
                )}
              </div>
            </Link>
          ))}
        </div>
        */}
      </div>
    </div>
  )
}

export default CourseDetailPage
