import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuiz, useSubmitQuizAnswer, useQuizStatus, useGenerateQuiz } from '../hooks'

const QuizPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answers, setAnswers] = useState<{ [key: number]: { selected: number; correct: boolean } }>({})
  
  // Fetch quiz data
  const { data: quiz, isLoading, isError } = useQuiz(videoId, false)
  const { data: quizStatus } = useQuizStatus(videoId)
  const generateMutation = useGenerateQuiz()
  const submitMutation = useSubmitQuizAnswer()

  const currentQuestionData = quiz?.questions?.[currentQuestion]
  const totalQuestions = quiz?.questions?.length || 5
  const score = Object.values(answers).filter(a => a.correct).length

  const handleGenerateQuiz = () => {
    if (videoId) {
      generateMutation.mutate(videoId)
    }
  }

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestionData) return

    try {
      const result = await submitMutation.mutateAsync({
        videoId: videoId!,
        questionId: currentQuestionData.id,
        selectedAnswer
      })
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: {
          selected: selectedAnswer,
          correct: result.correct
        }
      }))
      
      setShowFeedback(true)
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const handleViewResults = () => {
    // Could navigate to results page or show modal
    alert(`Quiz Complete!\n\nScore: ${score}/${totalQuestions}\nPercentage: ${Math.round((score / totalQuestions) * 100)}%`)
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

      {/* Loading/Error States */}
      {isLoading || quizStatus?.status === 'generating' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin text-5xl mb-4">⏳</div>
          <p className="text-lg font-semibold text-gray-900">Generating quiz...</p>
          <p className="text-sm text-gray-600 mt-2">This may take a minute</p>
        </div>
      ) : isError || quizStatus?.status === 'failed' || quizStatus?.status === 'not_started' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <p className="text-lg font-semibold text-gray-900 mb-2">Quiz not available</p>
          <p className="text-sm text-gray-600 mb-4">
            {quizStatus?.status === 'failed' ? 'Quiz generation failed' : 'Quiz hasn\'t been generated yet'}
          </p>
          <button
            onClick={handleGenerateQuiz}
            disabled={generateMutation.isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {generateMutation.isLoading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      ) : quiz && quiz.questions && quiz.questions.length > 0 ? (
        <>
          {/* Progress Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>
              <span className="text-sm text-gray-600">
                Score: {score}/{totalQuestions}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          {currentQuestionData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-4">
                  Difficulty: {currentQuestionData.difficulty || 'Medium'}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {currentQuestionData.question}
                </h2>
                <p className="text-sm text-gray-500">Select one answer</p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestionData.options.map((option, index) => (
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
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {showFeedback && submitMutation.data && (
                <div className={`mb-6 p-4 rounded-lg ${
                  submitMutation.data.correct 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    <span className={`text-xl ${
                      submitMutation.data.correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {submitMutation.data.correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className={`font-semibold mb-1 ${
                        submitMutation.data.correct ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {submitMutation.data.correct ? 'Correct!' : 'Incorrect'}
                      </p>
                      <p className={`text-sm ${
                        submitMutation.data.correct ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {submitMutation.data.explanation}
                      </p>
                      {submitMutation.data.timestamp_reference && (
                        <button 
                          onClick={() => navigate(`/courses/PLAYLIST_ID/lessons/${videoId}?t=${submitMutation.data!.timestamp_reference}`)}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          🎬 Jump to video at {submitMutation.data.timestamp_reference}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {!showFeedback ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null || submitMutation.isLoading}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {submitMutation.isLoading ? 'Submitting...' : 'Submit Answer'}
                </button>
              ) : (
                <button
                  onClick={currentQuestion < totalQuestions - 1 ? handleNextQuestion : handleViewResults}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  {currentQuestion < totalQuestions - 1 ? 'Next Question →' : 'View Results'}
                </button>
              )}
            </div>
          )}
        </>
      ) : null}

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
