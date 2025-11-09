import React from 'react'

interface QuizOption {
  id: string
  text: string
}

interface QuizFeedback {
  correct: boolean
  explanation: string
  timestamp_reference?: string
}

interface QuizCardProps {
  question: string
  options: QuizOption[]
  selectedAnswer?: string
  onSelectAnswer: (optionId: string) => void
  showFeedback: boolean
  feedback?: QuizFeedback
  difficulty?: string
  disabled?: boolean
  className?: string
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
  showFeedback,
  feedback,
  difficulty = 'Medium',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
      {/* Question Header */}
      <div className="mb-6">
        <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-4">
          Difficulty: {difficulty}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {question}
        </h2>
        <p className="text-sm text-gray-500">Select one answer</p>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => !disabled && !showFeedback && onSelectAnswer(option.id)}
            disabled={disabled || showFeedback}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === option.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            } ${disabled || showFeedback ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedAnswer === option.id
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-gray-300'
              }`}>
                {selectedAnswer === option.id && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
              <span className="text-gray-900">{option.text}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && feedback && (
        <div className={`p-4 rounded-lg ${
          feedback.correct 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-2">
            <span className={`text-xl ${
              feedback.correct ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedback.correct ? '✓' : '✗'}
            </span>
            <div className="flex-1">
              <p className={`font-semibold mb-1 ${
                feedback.correct ? 'text-green-900' : 'text-red-900'
              }`}>
                {feedback.correct ? 'Correct!' : 'Incorrect'}
              </p>
              <p className={`text-sm ${
                feedback.correct ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.explanation}
              </p>
              {feedback.timestamp_reference && (
                <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  🎬 Jump to video at {feedback.timestamp_reference}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizCard
