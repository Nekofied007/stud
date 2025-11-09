# STUD - Studying Till Unlocking Dreams

**AI-Powered Learning Platform**: Convert YouTube playlists into structured courses with transcripts, auto-generated quizzes, and a context-aware AI tutor.

## 🎯 Project Goals

- **Ingest YouTube playlists** → extract video metadata & transcripts
- **Auto-generate quizzes** from video content (no hallucination)
- **AI Tutor** that answers questions using only course transcripts (RAG-based)
- **Progress tracking** with gamification (badges, streaks)
- **Privacy-first**: minimal data collection, transparent policies

## 🛠 Tech Stack

### Backend
- **FastAPI** (Python 3.11+)
- **OpenAI Whisper** for transcription
- **OpenAI GPT-4** for quiz generation & tutoring
- **FAISS/Weaviate** for vector storage
- **PostgreSQL** for structured data

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for state management

### Infrastructure
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **MinIO** for object storage (S3-compatible)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+
- YouTube Data API key
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Nekofied007/stud.git
cd stud/stud-mvp
```

2. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

3. Start services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Health Check
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"0.1.0"}
```

## 📁 Project Structure

```
stud-mvp/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Config, security
│   │   ├── models/   # Pydantic models
│   │   ├── services/ # Business logic
│   │   └── main.py   # FastAPI app
│   ├── tests/        # Backend tests
│   └── requirements.txt
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── package.json
├── infra/             # Infrastructure as code
│   ├── docker-compose.yml
│   └── terraform/
├── docs/              # Documentation
│   ├── api.md
│   ├── privacy.md
│   └── architecture.md
└── tests/             # Integration tests
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
cd tests
./e2e_test.sh
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Architecture Overview](./docs/architecture.md)
- [Privacy Policy](./docs/privacy.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🔒 Safety & Legal

- ✅ Uses only public YouTube API (respects TOS)
- ✅ No API keys in code (environment variables only)
- ✅ Copyright-compliant (links + timestamps, not full transcripts)
- ✅ Anti-hallucination checks (tutor cites sources only)
- ✅ Rate limiting to prevent abuse

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📧 Contact

- Issues: [GitHub Issues](https://github.com/Nekofied007/stud/issues)
- Email: support@stud.education
