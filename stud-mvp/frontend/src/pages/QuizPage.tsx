import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

const QuizPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)

  // TODO: Fetch quiz from API
  // const { data: quiz, isLoading } = useQuery(['quiz', videoId], ...)

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return

    // TODO: Submit answer to API
    // POST /api/v1/quiz/video/{videoId}/question/{questionId}/submit

    setShowFeedback(true)
  }

  const handleNextQuestion = () => {
    setCurrentQuestion(prev => prev + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz</h1>
          <p className="text-gray-600">Video ID: {videoId}</p>
        </div>
        <Link
          to={`/courses/PLAYLIST_ID/lessons/${videoId}`}
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Lesson
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestion + 1} of 5
          </span>
          <span className="text-sm text-gray-600">
            Score: {score}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* TODO: Replace with actual quiz data */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-4">
            Difficulty: Medium
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Sample Question: What is the main topic covered in this video?
          </h2>
          <p className="text-sm text-gray-500">Select one answer</p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <button
              key={index}
              onClick={() => !showFeedback && setSelectedAnswer(index)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === index
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswer === index
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-900">Option {index + 1}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="font-semibold text-green-900 mb-1">Correct!</p>
                <p className="text-sm text-green-800">
                  Explanation: This answer is correct because...
                </p>
                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  🎬 Jump to video at 1:23
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {currentQuestion < 4 ? 'Next Question →' : 'View Results'}
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Tip:</strong> All quiz questions are generated from the video transcript. 
          Watch the video carefully to score higher!
        </p>
      </div>
    </div>
  )
}

export default QuizPage
