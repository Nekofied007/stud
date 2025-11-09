"""
API endpoints for video ingestion and transcription
Phase 1: YouTube playlist ingestion
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.schemas import IngestRequest, PlaylistData
from app.services.youtube_ingest import YouTubeIngestionService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/ingest", tags=["ingestion"])


@router.post("/playlist", response_model=PlaylistData, status_code=201)
async def ingest_playlist(request: IngestRequest):
    """
    Ingest a YouTube playlist and create a course
    
    Steps:
    1. Validate playlist URL
    2. Fetch playlist metadata from YouTube
    3. Extract video information
    4. Save to database
    5. (Optional) Trigger transcription jobs
    
    **Example request:**
    ```json
    {
      "playlist_url": "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
      "course_title": "Python for Beginners",
      "auto_transcribe": true
    }
    ```
    """
    try:
        service = YouTubeIngestionService()
        playlist_data = await service.ingest_playlist(str(request.playlist_url))
        
        logger.info(f"Successfully ingested playlist: {playlist_data.playlist_id}")
        
        # TODO: If auto_transcribe is True, queue transcription jobs
        
        return playlist_data
    
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to ingest playlist")


@router.get("/playlist/{playlist_id}", response_model=PlaylistData)
async def get_playlist(playlist_id: str):
    """
    Retrieve a previously ingested playlist by ID
    """
    import json
    from pathlib import Path
    from app.core.config import settings
    
    playlist_file = Path(settings.storage_path) / "playlists" / f"{playlist_id}.json"
    
    if not playlist_file.exists():
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    try:
        with open(playlist_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return PlaylistData(**data)
    except Exception as e:
        logger.error(f"Failed to load playlist: {e}")
        raise HTTPException(status_code=500, detail="Failed to load playlist")
