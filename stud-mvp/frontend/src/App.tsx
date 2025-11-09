import React, { useEffect, useState } from 'react'
import './App.css'

interface HealthStatus {
  status: string
  version: string
  service: string
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Health check failed:', err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-indigo-600 mb-2">
            STUD
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Studying Till Unlocking Dreams
          </p>
          
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 Phase 0: Setup Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              Transform YouTube playlists into structured courses with AI-powered quizzes and tutoring
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <span>Checking backend health...</span>
            </div>
          ) : health ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">✅ Backend Connected</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Status: <span className="font-mono">{health.status}</span></p>
                <p>Version: <span className="font-mono">{health.version}</span></p>
                <p>Service: <span className="font-mono">{health.service}</span></p>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">❌ Backend Not Responding</p>
              <p className="text-sm text-gray-600 mt-2">Make sure Docker services are running</p>
            </div>
          )}

          <div className="mt-8 grid grid-cols-2 gap-4">
            <a 
              href="http://localhost:8000/docs" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              📚 API Docs
            </a>
            <a 
              href="https://github.com/Nekofied007/stud" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-6 rounded-lg font-medium transition-colors"
            >
              💻 GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
