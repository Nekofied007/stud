import React, { forwardRef, useImperativeHandle, useRef } from 'react'

interface VideoPlayerProps {
  videoId: string
  className?: string
  autoplay?: boolean
  startTime?: number
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void
  getCurrentTime: () => number
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, className = '', autoplay = false, startTime = 0 }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        if (iframeRef.current) {
          // Send postMessage to YouTube iframe to seek
          iframeRef.current.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'seekTo',
              args: [seconds, true]
            }),
            '*'
          )
        }
      },
      getCurrentTime: () => {
        // Note: Getting current time requires YouTube IFrame API
        // This is a simplified version
        return 0
      }
    }))

    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1${autoplay ? '&autoplay=1' : ''}${startTime ? `&start=${startTime}` : ''}`

    return (
      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden ${className}`}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
