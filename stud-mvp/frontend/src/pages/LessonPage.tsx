import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranscript, useVideo, useTranscribeVideo, useTranscriptionStatus } from '../hooks'
import { formatTimestamp } from '../api/transcribe'

const LessonPage: React.FC = () => {
  const { playlistId, videoId } = useParams<{ playlistId: string; videoId: string }>()
  const [activeSegment, setActiveSegment] = useState<number | null>(null)

  // Fetch video metadata
  const { data: video } = useVideo(videoId)
  
  // Fetch transcript
  const { data: transcript, isLoading: transcriptLoading, isError: transcriptError } = useTranscript(videoId)
  
  // Fetch transcription status
  const { data: status } = useTranscriptionStatus(videoId)
  
  // Mutation to start transcription
  const transcribeMutation = useTranscribeVideo()

  const handleStartTranscription = () => {
    if (videoId) {
      transcribeMutation.mutate(videoId)
    }
  }

  const handleSegmentClick = (startTime: number, index: number) => {
    setActiveSegment(index)
    // TODO: Seek video to timestamp (requires video player ref)
    console.log('Seek to:', startTime)
  }

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
              {video?.title || 'Lesson Title'}
            </h1>
            <p className="text-gray-600 mb-2">
              {video?.description && (
                <span className="text-sm line-clamp-2">{video.description}</span>
              )}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Duration: {video?.duration || 'Unknown'} • Video ID: {videoId}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
              {status && status.status === 'pending' && (
                <button
                  onClick={handleStartTranscription}
                  disabled={transcribeMutation.isLoading}
                  className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  {transcribeMutation.isLoading ? 'Starting...' : 'Generate'}
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 text-sm">
              {transcriptLoading || status?.status === 'processing' ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin text-3xl mb-4">⏳</div>
                  <p>Transcribing video...</p>
                  <p className="text-xs mt-2">This may take a few minutes</p>
                </div>
              ) : transcriptError || status?.status === 'failed' ? (
                <div className="text-center py-12 text-red-500">
                  <p>❌ Transcription failed</p>
                  <button
                    onClick={handleStartTranscription}
                    className="mt-3 text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Retry
                  </button>
                </div>
              ) : transcript && transcript.segments && transcript.segments.length > 0 ? (
                transcript.segments.map((segment, index) => (
                  <button
                    key={index}
                    onClick={() => handleSegmentClick(segment.start, index)}
                    className={`block w-full text-left p-3 rounded-lg transition-colors ${
                      activeSegment === index 
                        ? 'bg-indigo-50 border-l-4 border-indigo-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-xs text-indigo-600 font-medium mb-1">
                      {formatTimestamp(segment.start)}
                    </div>
                    <div className="text-gray-700 text-sm">
                      {segment.text}
                    </div>
                  </button>
                ))
              ) : status?.status === 'pending' ? (
                <div className="text-center py-12 text-gray-500">
                  <p>📝 Transcript not generated yet</p>
                  <button
                    onClick={handleStartTranscription}
                    disabled={transcribeMutation.isLoading}
                    className="mt-3 text-sm px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {transcribeMutation.isLoading ? 'Starting...' : 'Generate Transcript'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No transcript available</p>
                </div>
              )}
            </div>

            {/* Transcript Actions */}
            {transcript && transcript.segments && transcript.segments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600">
                <p>💡 Click any segment to jump to that point in the video</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonPage
