"""
Video transcription service using OpenAI Whisper
Handles audio extraction and speech-to-text conversion
"""
import subprocess
import json
from pathlib import Path
from typing import Optional
import whisper
from app.core.config import settings
from app.models.schemas import TranscriptData, TranscriptChunk


class TranscriptionService:
    """Service for transcribing videos using Whisper"""
    
    def __init__(self):
        self.model_name = settings.whisper_model
        self.model = None
        self.storage_path = Path(settings.storage_path)
        
    def _load_model(self):
        """Lazy load Whisper model"""
        if self.model is None:
            print(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
        return self.model
    
    def download_audio(self, video_id: str, output_dir: Optional[Path] = None) -> Path:
        """
        Download audio from YouTube video using yt-dlp
        Returns path to downloaded audio file
        """
        if output_dir is None:
            output_dir = self.storage_path / "audio"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_template = str(output_dir / f"{video_id}.%(ext)s")
        youtube_url = f"https://www.youtube.com/watch?v={video_id}"
        
        # yt-dlp command to download audio only
        cmd = [
            "yt-dlp",
            "-f", "bestaudio/best",  # Best audio quality
            "--extract-audio",  # Extract audio
            "--audio-format", "mp3",  # Convert to MP3
            "--audio-quality", "0",  # Best quality
            "-o", output_template,
            youtube_url
        ]
        
        try:
            print(f"Downloading audio for video: {video_id}")
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True,
                timeout=settings.max_video_duration_minutes * 60
            )
            
            audio_file = output_dir / f"{video_id}.mp3"
            if not audio_file.exists():
                raise FileNotFoundError(f"Audio file not found: {audio_file}")
            
            print(f"✅ Audio downloaded: {audio_file}")
            return audio_file
            
        except subprocess.TimeoutExpired:
            raise Exception(f"Audio download timed out for video: {video_id}")
        except subprocess.CalledProcessError as e:
            raise Exception(f"yt-dlp failed: {e.stderr}")
    
    def transcribe_audio(self, audio_file: Path) -> dict:
        """
        Transcribe audio file using Whisper
        Returns Whisper result dict with segments
        """
        model = self._load_model()
        
        print(f"Transcribing: {audio_file.name}")
        result = model.transcribe(
            str(audio_file),
            verbose=False,
            word_timestamps=False  # Set to True for word-level timestamps (slower)
        )
        
        return result
    
    def process_transcript_segments(self, whisper_result: dict, video_id: str) -> TranscriptData:
        """
        Process Whisper result into TranscriptData format
        Chunks are created from Whisper segments (typically 5-10 seconds each)
        """
        chunks = []
        
        for segment in whisper_result.get("segments", []):
            chunk = TranscriptChunk(
                start=float(segment["start"]),
                end=float(segment["end"]),
                text=segment["text"].strip()
            )
            chunks.append(chunk)
        
        transcript_data = TranscriptData(
            video_id=video_id,
            transcript=chunks
        )
        
        return transcript_data
    
    def save_transcript(self, transcript_data: TranscriptData):
        """Save transcript to JSON file"""
        output_dir = self.storage_path / "transcripts"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"{transcript_data.video_id}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(transcript_data.model_dump(mode='json'), f, indent=2)
        
        print(f"✅ Saved transcript to: {output_file}")
    
    async def transcribe_video(self, video_id: str, cleanup_audio: bool = True) -> TranscriptData:
        """
        Main method: Transcribe a YouTube video
        
        Steps:
        1. Download audio using yt-dlp
        2. Transcribe with Whisper
        3. Process segments into chunks
        4. Save transcript JSON
        5. Cleanup audio file (optional)
        
        Returns TranscriptData with timestamped chunks
        """
        try:
            # Download audio
            audio_file = self.download_audio(video_id)
            
            # Transcribe
            whisper_result = self.transcribe_audio(audio_file)
            
            # Process segments
            transcript_data = self.process_transcript_segments(whisper_result, video_id)
            
            # Save transcript
            self.save_transcript(transcript_data)
            
            # Cleanup audio
            if cleanup_audio and audio_file.exists():
                audio_file.unlink()
                print(f"🗑️  Deleted audio file: {audio_file.name}")
            
            return transcript_data
            
        except Exception as e:
            print(f"❌ Transcription failed for {video_id}: {e}")
            raise
    
    def load_transcript(self, video_id: str) -> Optional[TranscriptData]:
        """Load existing transcript from disk"""
        transcript_file = self.storage_path / "transcripts" / f"{video_id}.json"
        
        if not transcript_file.exists():
            return None
        
        with open(transcript_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return TranscriptData(**data)


# CLI interface for testing
if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python transcribe.py <video_id>")
        print("Example: python transcribe.py dQw4w9WgXcQ")
        sys.exit(1)
    
    video_id = sys.argv[1]
    
    async def main():
        service = TranscriptionService()
        transcript = await service.transcribe_video(video_id)
        print(f"\n✅ Transcription complete!")
        print(f"   Video: {transcript.video_id}")
        print(f"   Chunks: {len(transcript.transcript)}")
        print(f"   First chunk: {transcript.transcript[0].text[:100]}...")
    
    asyncio.run(main())
