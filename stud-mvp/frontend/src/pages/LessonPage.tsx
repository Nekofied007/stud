import React from 'react'
import { useParams, Link } from 'react-router-dom'

const LessonPage: React.FC = () => {
  const { playlistId, videoId } = useParams<{ playlistId: string; videoId: string }>()

  // TODO: Fetch transcript from API
  // const { data: transcript, isLoading } = useQuery(['transcript', videoId], ...)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/courses" className="hover:text-indigo-600">Courses</Link>
        <span>/</span>
        <Link to={`/courses/${playlistId}`} className="hover:text-indigo-600">Course</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Lesson</span>
      </nav>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* YouTube Player */}
          <div className="bg-black rounded-lg overflow-hidden aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Lesson Video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {/* TODO: Replace with actual video title */}
              Lesson Title
            </h1>
            <p className="text-gray-600 mb-4">
              Video ID: {videoId}
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Link
                to={`/quiz/${videoId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                📝 Take Quiz
              </Link>
              <Link
                to={`/tutor?video=${videoId}`}
                className="px-4 py-2 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                🤖 Ask Tutor
              </Link>
            </div>
          </div>
        </div>

        {/* Transcript - Right Column (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
            
            {/* TODO: Replace with actual transcript */}
            <div className="flex-1 overflow-y-auto space-y-4 text-sm">
              <div className="text-center py-12 text-gray-500">
                <p>Loading transcript...</p>
                <p className="text-xs mt-2">Transcripts are generated automatically</p>
              </div>

              {/* Example transcript segment (commented out) */}
              {/*
              {transcript?.segments.map((segment, index) => (
                <button
                  key={index}
                  onClick={() => seekToTimestamp(segment.start)}
                  className="block w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-xs text-indigo-600 font-medium mb-1">
                    {formatTimestamp(segment.start)}
                  </div>
                  <div className="text-gray-700">
                    {segment.text}
                  </div>
                </button>
              ))}
              */}
            </div>

            {/* Transcript Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
              <p>Click any segment to jump to that point in the video</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPage
