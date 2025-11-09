import React from 'react'

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  activeSegment?: number
  onSegmentClick?: (timestamp: number, index: number) => void
  className?: string
}

const formatTimestamp = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ 
  segments,
  activeSegment,
  onSegmentClick,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {segments.map((segment, index) => (
        <button
          key={index}
          onClick={() => onSegmentClick?.(segment.start, index)}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            activeSegment === index
              ? 'bg-indigo-50 border-l-4 border-indigo-600'
              : 'hover:bg-gray-50 border-l-4 border-transparent'
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-sm font-mono text-indigo-600 font-medium whitespace-nowrap">
              {formatTimestamp(segment.start)}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed flex-1">
              {segment.text}
            </p>
          </div>
        </button>
      ))}
      {segments.length > 0 && (
        <p className="text-xs text-gray-500 text-center mt-4 pt-4 border-t">
          💡 Click any segment to jump to that point in the video
        </p>
      )}
    </div>
  )
}

export default TranscriptViewer
