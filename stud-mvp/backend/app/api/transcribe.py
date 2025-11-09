"""
API endpoints for video transcription
Phase 1: Whisper transcription
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.schemas import TranscriptData
from app.services.transcription import TranscriptionService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/transcribe", tags=["transcription"])


@router.post("/video/{video_id}", status_code=202)
async def transcribe_video(
    video_id: str,
    background_tasks: BackgroundTasks,
    cleanup_audio: bool = True
):
    """
    Transcribe a YouTube video using Whisper
    
    This endpoint triggers transcription in the background and returns immediately.
    Check status with GET /transcribe/status/{video_id}
    
    **Path Parameters:**
    - `video_id`: YouTube video ID (e.g., "dQw4w9WgXcQ")
    
    **Query Parameters:**
    - `cleanup_audio`: Delete audio file after transcription (default: true)
    
    **Returns:**
    ```json
    {
      "video_id": "abc123",
      "status": "transcribing",
      "message": "Transcription started in background"
    }
    ```
    """
    try:
        service = TranscriptionService()
        
        # Check if transcript already exists
        existing = service.load_transcript(video_id)
        if existing:
            return {
                "video_id": video_id,
                "status": "completed",
                "message": "Transcript already exists",
                "chunks": len(existing.transcript)
            }
        
        # Start transcription in background
        background_tasks.add_task(
            service.transcribe_video,
            video_id=video_id,
            cleanup_audio=cleanup_audio
        )
        
        logger.info(f"Started transcription for video: {video_id}")
        
        return {
            "video_id": video_id,
            "status": "transcribing",
            "message": "Transcription started in background"
        }
    
    except Exception as e:
        logger.error(f"Failed to start transcription: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}", response_model=TranscriptData)
async def get_transcript(video_id: str):
    """
    Retrieve transcript for a video
    
    Returns the complete transcript with timestamped chunks.
    Returns 404 if transcript doesn't exist yet.
    """
    try:
        service = TranscriptionService()
        transcript = service.load_transcript(video_id)
        
        if not transcript:
            raise HTTPException(
                status_code=404,
                detail=f"Transcript not found for video: {video_id}"
            )
        
        return transcript
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to load transcript: {e}")
        raise HTTPException(status_code=500, detail="Failed to load transcript")


@router.get("/status/{video_id}")
async def get_transcription_status(video_id: str):
    """
    Check transcription status for a video
    
    **Returns:**
    ```json
    {
      "video_id": "abc123",
      "status": "completed|not_started|error",
      "chunks": 45,
      "error": "Error message if failed"
    }
    ```
    """
    service = TranscriptionService()
    transcript = service.load_transcript(video_id)
    
    if transcript:
        return {
            "video_id": video_id,
            "status": "completed",
            "chunks": len(transcript.transcript)
        }
    else:
        # TODO: Check background job status
        # For now, just return not_started
        return {
            "video_id": video_id,
            "status": "not_started",
            "message": "Transcript not found. Call POST /transcribe/video/{video_id} to start transcription."
        }
