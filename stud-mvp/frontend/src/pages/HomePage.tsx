import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'online' | 'offline'>('loading')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">STUD</span>
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          <span className="font-semibold">S</span>tudying{' '}
          <span className="font-semibold">T</span>ill{' '}
          <span className="font-semibold">U</span>nlocking{' '}
          <span className="font-semibold">D</span>reams
        </p>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          Transform YouTube playlists into interactive learning experiences with AI-powered quizzes and personalized tutoring
        </p>

        {/* Backend Status */}
        <div className="flex justify-center items-center space-x-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${
            backendStatus === 'online' ? 'bg-green-500' :
            backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-gray-600">
            Backend: {backendStatus === 'loading' ? 'Checking...' : backendStatus}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center space-x-4">
          <Link
            to="/courses"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            Browse Courses
          </Link>
          <Link
            to="/tutor"
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Try AI Tutor
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">YouTube Integration</h3>
          <p className="text-gray-600">
            Import any YouTube playlist and automatically transcribe video content using Whisper AI
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Quizzes</h3>
          <p className="text-gray-600">
            AI-generated quizzes based on video transcripts to test your understanding
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-3xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Tutor</h3>
          <p className="text-gray-600">
            Ask questions and get answers grounded in the video content with timestamp citations
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mt-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Add a YouTube Playlist</h4>
              <p className="text-gray-600">Paste the playlist URL and we'll import all videos</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">AI Transcription</h4>
              <p className="text-gray-600">We transcribe videos using OpenAI Whisper</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Learn & Quiz</h4>
              <p className="text-gray-600">Watch videos, review transcripts, and take AI-generated quizzes</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Ask Your AI Tutor</h4>
              <p className="text-gray-600">Get answers from your personal AI tutor trained on the content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
