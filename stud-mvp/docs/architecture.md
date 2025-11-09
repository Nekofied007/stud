# STUD Architecture

## Overview

STUD is a microservices-based learning platform that transforms YouTube playlists into structured courses with AI-powered features.

## System Components

### 1. Backend (FastAPI)
- **Ingestion Service**: Fetches YouTube playlist metadata and videos
- **Transcription Service**: Converts audio to text using Whisper
- **Content Generation Service**: Creates quizzes and summaries using GPT
- **AI Tutor Service**: RAG-based question answering system
- **Progress Tracking**: User progress and gamification

### 2. Frontend (React + TypeScript)
- **Course Browser**: Browse and search courses
- **Video Player**: Embedded YouTube player with timestamp navigation
- **Quiz Interface**: Interactive multiple-choice quizzes
- **Chat Interface**: AI tutor conversation
- **Dashboard**: Progress tracking and badges

### 3. Data Layer
- **PostgreSQL**: Structured data (users, courses, progress)
- **Redis**: Caching and background job queue
- **Weaviate**: Vector embeddings for semantic search
- **Local/S3**: Video metadata and transcript storage

## Data Flow

### Course Creation Pipeline
```
YouTube Playlist URL
    ↓
[1] Fetch Metadata (YouTube API)
    ↓
[2] Download Audio (yt-dlp)
    ↓
[3] Transcribe (Whisper)
    ↓
[4] Chunk & Embed (OpenAI Embeddings)
    ↓
[5] Generate Quiz (GPT-4)
    ↓
[6] Generate Summary (GPT-4)
    ↓
Store in DB + Vector Store
```

### AI Tutor Query Flow
```
User Question
    ↓
[1] Embed Question (OpenAI Embeddings)
    ↓
[2] Retrieve Top-K Chunks (Weaviate)
    ↓
[3] Build Context Prompt
    ↓
[4] Generate Answer (GPT-4)
    ↓
[5] Extract Sources & Timestamps
    ↓
Return JSON Response
```

## Data Models

### Playlist
```json
{
  "playlist_id": "string",
  "title": "string",
  "description": "string",
  "videos": ["video_id", ...]
}
```

### Video
```json
{
  "video_id": "string",
  "title": "string",
  "duration_seconds": 600,
  "youtube_url": "string",
  "published_at": "ISO8601",
  "transcript_id": "string",
  "quiz_id": "string"
}
```

### Transcript
```json
{
  "video_id": "string",
  "chunks": [
    {
      "chunk_id": "string",
      "start": 0.0,
      "end": 10.0,
      "text": "string",
      "embedding": [...]
    }
  ]
}
```

### Quiz
```json
{
  "video_id": "string",
  "questions": [
    {
      "q_id": "string",
      "question_text": "string",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "string",
      "difficulty": "recall|apply|analyze",
      "requires_review": false
    }
  ]
}
```

## Security

- **API Keys**: Stored in environment variables, never in code
- **Authentication**: JWT tokens (future: OAuth)
- **Rate Limiting**: Per-user and per-endpoint limits
- **Input Validation**: Pydantic models validate all inputs
- **CORS**: Restricted to known frontend origins

## Scalability Considerations

### Current (MVP)
- Single backend instance
- Synchronous transcription (blocks request)
- In-memory job queue

### Future (Production)
- Horizontal scaling with load balancer
- Async transcription with Celery + Redis
- Cloud storage (S3)
- CDN for static assets
- Kubernetes deployment

## Monitoring & Observability

- **Health Checks**: `/health` endpoint
- **Logging**: Structured JSON logs
- **Metrics**: (Future) Prometheus + Grafana
- **Error Tracking**: (Future) Sentry

## Cost Optimization

- **Whisper**: Run locally (free) vs API ($0.006/min)
- **GPT-4**: Use GPT-3.5-turbo for non-critical tasks
- **Embeddings**: Batch embed operations
- **Caching**: Redis caches expensive operations
- **Rate Limits**: Prevent abuse and control costs
