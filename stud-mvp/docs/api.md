# API Documentation

Base URL: `http://localhost:8000`

## Health & Status

### GET /health
Health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "service": "stud-backend"
}
```

---

## Playlist Ingestion (Phase 1)

### POST /api/v1/ingest/playlist
Ingest a YouTube playlist and create a course.

**Request Body:**
```json
{
  "playlist_url": "https://www.youtube.com/playlist?list=PL123",
  "course_title": "Optional custom title",
  "auto_transcribe": true
}
```

**Response 201:**
```json
{
  "playlist_id": "PL123",
  "title": "Playlist Title",
  "video_count": 10,
  "status": "processing",
  "job_id": "uuid"
}
```

**Response 400:** Invalid URL or playlist not found

---

### POST /api/v1/transcribe/video/{video_id}
Transcribe a specific video.

**Path Parameters:**
- `video_id` (string): YouTube video ID

**Response 202:**
```json
{
  "video_id": "abcd1234",
  "status": "transcribing",
  "job_id": "uuid",
  "estimated_time_seconds": 120
}
```

---

### GET /api/v1/transcribe/status/{job_id}
Check transcription job status.

**Response 200:**
```json
{
  "job_id": "uuid",
  "status": "completed|processing|failed",
  "progress": 75,
  "result": {
    "transcript_id": "string",
    "chunks": 45
  }
}
```

---

## Content Generation (Phase 2)

### POST /api/v1/generate/quiz/{video_id}
Generate quiz from video transcript.

**Query Parameters:**
- `num_questions` (int, default=5): Number of questions

**Response 200:**
```json
{
  "video_id": "abcd",
  "quiz": [
    {
      "q_id": "q1",
      "question_text": "What is...?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 1,
      "explanation": "Because...",
      "difficulty": "recall",
      "requires_review": false
    }
  ]
}
```

---

### POST /api/v1/generate/summary/{video_id}
Generate video summary.

**Response 200:**
```json
{
  "video_id": "abcd",
  "tldr": "One sentence summary",
  "short": "4-6 sentence summary with [00:01:23] timestamps",
  "bullets": [
    {
      "text": "Key point",
      "timestamp": "01:23"
    }
  ]
}
```

---

## AI Tutor (Phase 2)

### POST /api/v1/tutor/ask
Ask the AI tutor a question.

**Request Body:**
```json
{
  "course_id": "string",
  "question": "What is the difference between...?",
  "context": {
    "current_video_id": "abcd",
    "current_timestamp": 120.5
  }
}
```

**Response 200:**
```json
{
  "answer_text": "The main difference is...",
  "confidence": "High|Medium|Low",
  "sources": [
    {
      "video_id": "abcd",
      "start": 120.0,
      "end": 140.0,
      "url": "https://youtu.be/abcd?t=120"
    }
  ],
  "followups": [
    "Try practicing X",
    "Rewatch 02:00-03:10 for more detail"
  ]
}
```

**Response 200 (Insufficient Context):**
```json
{
  "answer_text": "INSUFFICIENT_CONTEXT",
  "confidence": "Low",
  "sources": [],
  "followups": [
    "Watch Video 1 from 00:30-01:20",
    "Search the course for 'specific topic'"
  ]
}
```

---

## Course Management (Phase 3)

### GET /api/v1/courses
List all courses.

**Query Parameters:**
- `limit` (int, default=20)
- `offset` (int, default=0)

**Response 200:**
```json
{
  "courses": [
    {
      "course_id": "uuid",
      "title": "Course Title",
      "video_count": 10,
      "total_duration_minutes": 180,
      "created_at": "ISO8601"
    }
  ],
  "total": 50
}
```

---

### GET /api/v1/courses/{course_id}
Get course details.

**Response 200:**
```json
{
  "course_id": "uuid",
  "title": "Course Title",
  "description": "...",
  "videos": [
    {
      "video_id": "abcd",
      "title": "Video 1",
      "duration_seconds": 600,
      "has_quiz": true,
      "has_transcript": true
    }
  ]
}
```

---

## User Progress (Phase 3 & 4)

### GET /api/v1/progress/{course_id}
Get user progress for a course.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response 200:**
```json
{
  "course_id": "uuid",
  "completed_videos": 5,
  "total_videos": 10,
  "quiz_scores": {
    "video_1": 80,
    "video_2": 90
  },
  "badges": [
    {
      "badge_id": "first_course",
      "name": "First Steps",
      "earned_at": "ISO8601"
    }
  ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid playlist URL",
  "details": {...}
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or missing token"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "You have exceeded the rate limit",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "request_id": "uuid"
}
```

---

## Rate Limits

- **Free Tier**: 10 requests/minute
- **Premium Tier**: 100 requests/minute

Rate limit headers included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
