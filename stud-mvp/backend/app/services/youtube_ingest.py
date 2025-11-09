"""
YouTube playlist ingestion service
Fetches playlist metadata and video information using YouTube Data API v3
"""
import re
import json
from typing import Optional
from datetime import datetime
from pathlib import Path
import httpx
from app.core.config import settings
from app.models.schemas import PlaylistData, VideoMetadata


class YouTubeIngestionService:
    """Service for ingesting YouTube playlists"""
    
    BASE_URL = "https://www.googleapis.com/youtube/v3"
    
    def __init__(self):
        self.api_key = settings.youtube_api_key
        if not self.api_key:
            raise ValueError("YOUTUBE_API_KEY not set in environment")
    
    def extract_playlist_id(self, playlist_url: str) -> str:
        """
        Extract playlist ID from YouTube URL
        Supports formats:
        - https://www.youtube.com/playlist?list=PLxxx
        - https://youtube.com/playlist?list=PLxxx
        """
        patterns = [
            r'[?&]list=([a-zA-Z0-9_-]+)',
            r'playlist\?list=([a-zA-Z0-9_-]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, playlist_url)
            if match:
                return match.group(1)
        
        raise ValueError(f"Could not extract playlist ID from URL: {playlist_url}")
    
    async def get_playlist_metadata(self, playlist_id: str) -> dict:
        """
        Fetch playlist metadata from YouTube API
        Returns playlist title and description
        """
        url = f"{self.BASE_URL}/playlists"
        params = {
            "part": "snippet,contentDetails",
            "id": playlist_id,
            "key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()
        
        if not data.get("items"):
            raise ValueError(f"Playlist not found: {playlist_id}")
        
        item = data["items"][0]
        return {
            "title": item["snippet"]["title"],
            "description": item["snippet"].get("description", ""),
            "item_count": item["contentDetails"]["itemCount"]
        }
    
    async def get_playlist_videos(self, playlist_id: str, max_results: int = 50) -> list:
        """
        Fetch all videos from a playlist
        Handles pagination automatically
        """
        all_videos = []
        page_token = None
        
        url = f"{self.BASE_URL}/playlistItems"
        
        while True:
            params = {
                "part": "snippet,contentDetails",
                "playlistId": playlist_id,
                "maxResults": min(max_results, 50),  # API limit is 50
                "key": self.api_key
            }
            
            if page_token:
                params["pageToken"] = page_token
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, params=params, timeout=30.0)
                response.raise_for_status()
                data = response.json()
            
            items = data.get("items", [])
            all_videos.extend(items)
            
            page_token = data.get("nextPageToken")
            if not page_token or len(all_videos) >= max_results:
                break
        
        return all_videos[:max_results]
    
    async def get_video_details(self, video_ids: list) -> dict:
        """
        Fetch detailed information for multiple videos
        Returns dict with video_id as key
        """
        # YouTube API allows up to 50 IDs per request
        url = f"{self.BASE_URL}/videos"
        params = {
            "part": "contentDetails,snippet",
            "id": ",".join(video_ids),
            "key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()
        
        video_details = {}
        for item in data.get("items", []):
            video_id = item["id"]
            duration = self._parse_duration(item["contentDetails"]["duration"])
            
            video_details[video_id] = {
                "duration_seconds": duration,
                "published_at": item["snippet"]["publishedAt"]
            }
        
        return video_details
    
    def _parse_duration(self, duration_str: str) -> int:
        """
        Parse ISO 8601 duration format (PT1H2M3S) to seconds
        Examples:
        - PT1H2M3S = 3723 seconds
        - PT15M = 900 seconds
        - PT45S = 45 seconds
        """
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration_str)
        if not match:
            return 0
        
        hours = int(match.group(1) or 0)
        minutes = int(match.group(2) or 0)
        seconds = int(match.group(3) or 0)
        
        return hours * 3600 + minutes * 60 + seconds
    
    async def ingest_playlist(self, playlist_url: str) -> PlaylistData:
        """
        Main method: Ingest a YouTube playlist
        Returns PlaylistData with complete metadata
        
        Steps:
        1. Extract playlist ID from URL
        2. Fetch playlist metadata
        3. Fetch all videos in playlist
        4. Fetch detailed video information (duration, etc.)
        5. Validate and return structured data
        """
        # Extract playlist ID
        playlist_id = self.extract_playlist_id(playlist_url)
        
        # Get playlist metadata
        playlist_meta = await self.get_playlist_metadata(playlist_id)
        
        # Get all videos
        playlist_items = await self.get_playlist_videos(playlist_id)
        
        if not playlist_items:
            raise ValueError(f"No videos found in playlist: {playlist_id}")
        
        # Extract video IDs
        video_ids = [
            item["contentDetails"]["videoId"]
            for item in playlist_items
            if item["snippet"]["title"] != "Private video"  # Skip private videos
        ]
        
        # Get detailed video information
        video_details = await self.get_video_details(video_ids)
        
        # Build video metadata list
        videos = []
        for item in playlist_items:
            video_id = item["contentDetails"]["videoId"]
            
            # Skip if video details not available
            if video_id not in video_details:
                continue
            
            details = video_details[video_id]
            
            video = VideoMetadata(
                video_id=video_id,
                title=item["snippet"]["title"],
                duration_seconds=details["duration_seconds"],
                youtube_url=f"https://youtu.be/{video_id}",
                published_at=datetime.fromisoformat(details["published_at"].replace("Z", "+00:00"))
            )
            videos.append(video)
        
        # Create PlaylistData
        playlist_data = PlaylistData(
            playlist_id=playlist_id,
            title=playlist_meta["title"],
            videos=videos
        )
        
        # Save to disk
        self._save_playlist_data(playlist_data)
        
        return playlist_data
    
    def _save_playlist_data(self, playlist_data: PlaylistData):
        """Save playlist data to JSON file"""
        output_dir = Path(settings.storage_path) / "playlists"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"{playlist_data.playlist_id}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(playlist_data.model_dump(mode='json'), f, indent=2, default=str)
        
        print(f"✅ Saved playlist data to: {output_file}")


# CLI interface for testing
if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ingest.py <playlist_url>")
        sys.exit(1)
    
    playlist_url = sys.argv[1]
    
    async def main():
        service = YouTubeIngestionService()
        result = await service.ingest_playlist(playlist_url)
        print(f"\n✅ Ingested playlist: {result.title}")
        print(f"   Videos: {len(result.videos)}")
        for i, video in enumerate(result.videos[:5], 1):
            print(f"   {i}. {video.title} ({video.duration_seconds}s)")
    
    asyncio.run(main())
