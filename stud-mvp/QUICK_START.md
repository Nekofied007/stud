# 🚀 STUD MVP - Quick Start Guide

**Welcome to STUD!** Your AI-powered learning platform is ready to launch. Follow these steps to get started.

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Docker Desktop** installed (for easiest setup)
  - Download: https://www.docker.com/products/docker-desktop
- ✅ **OpenAI API Key** (required for Whisper, GPT-4, embeddings)
  - Get one: https://platform.openai.com/api-keys
- ✅ **YouTube Data API Key** (required for playlist imports)
  - Get one: https://console.cloud.google.com/apis/credentials

**OR** if running locally without Docker:
- Python 3.11+
- Node.js 18+
- FFmpeg (for audio processing)

---

## 🐳 Option 1: Docker (Recommended)

### Step 1: Configure Environment Variables

1. **Edit `.env` file** in the root directory:

```bash
# Required API Keys
OPENAI_API_KEY=sk-...your-key...
YOUTUBE_API_KEY=AIza...your-key...

# Generate a secure SECRET_KEY (run in PowerShell):
# -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-generated-secret-key-here

# Optional: Sentry for monitoring
SENTRY_DSN=https://...your-sentry-dsn...

# Environment
ENVIRONMENT=production

# CORS (add your production domain)
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Step 2: Start Services

```powershell
# Navigate to project directory
cd c:\Users\vardh\Desktop\fraffe\lms\stud-mvp

# Start all services (backend, frontend, PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Step 4: Create Your First Account

1. Navigate to http://localhost:3000
2. Click **"Sign Up"**
3. Create account with username, email, password
4. Log in and start learning!

---

## 💻 Option 2: Local Development (Without Docker)

### Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment file
Copy-Item .env.example .env
# Edit .env with your API keys

# Initialize database
python -c "from app.core.database import init_db; init_db()"

# Run backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### Frontend Setup

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env
# Edit .env if needed (default points to localhost:8000)

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 📖 Using the Application

### 1. Import a YouTube Playlist

1. Go to **Courses** page
2. Click **"Import from YouTube"**
3. Paste a YouTube playlist URL
4. Wait for import (can take a few minutes)

### 2. Watch & Learn

1. Click on an imported course
2. Select a video/lesson
3. Watch the video with synchronized transcript
4. Use timestamps to jump to specific sections

### 3. Take a Quiz

1. After watching, click **"Take Quiz"**
2. AI generates questions from the content
3. Answer multiple-choice questions
4. Get instant feedback and scores

### 4. Ask the AI Tutor

1. Click **"Ask Tutor"** while learning
2. Ask questions about the content
3. Get detailed explanations from GPT-4
4. Tutor remembers conversation context

### 5. Track Your Progress

1. View completed lessons on Course page
2. See quiz scores and history
3. Review tutor conversations
4. Monitor learning streaks

---

## 🔧 Testing

### Run Backend Tests

```powershell
cd backend
pytest tests/ -v --cov=app
```

### Run Frontend Unit Tests

```powershell
cd frontend
npm run test:unit
```

### Run E2E Tests

```powershell
cd frontend
npm run test:e2e
```

---

## 🚢 Production Deployment

### Deploy to Cloud Platform

**Option A: Railway** (Easiest)
1. Connect GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy backend and frontend as separate services
4. Configure custom domain

**Option B: DigitalOcean/AWS/Azure**
1. Use Docker Compose on a VPS
2. Configure nginx reverse proxy
3. Set up SSL with Let's Encrypt
4. Configure PostgreSQL and Redis

**Option C: Vercel (Frontend) + Railway (Backend)**
1. Deploy frontend to Vercel
2. Deploy backend to Railway
3. Update `VITE_API_URL` in Vercel environment variables

### Pre-Deployment Checklist

- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure production `CORS_ORIGINS`
- [ ] Set up PostgreSQL database (not SQLite)
- [ ] Configure Sentry for error tracking
- [ ] Enable HTTPS/SSL
- [ ] Set up backups for database
- [ ] Configure monitoring/logging
- [ ] Test authentication flow
- [ ] Run full test suite

---

## 🐛 Troubleshooting

### Backend won't start
- **Issue**: Missing API keys
- **Fix**: Ensure `OPENAI_API_KEY` and `YOUTUBE_API_KEY` are set in `.env`

### Frontend can't connect to backend
- **Issue**: CORS error
- **Fix**: Add frontend URL to `CORS_ORIGINS` in backend `.env`

### Database errors
- **Issue**: SQLite locked or permissions issue
- **Fix**: Use PostgreSQL in production, ensure `data/` directory is writable

### Import fails
- **Issue**: YouTube API quota exceeded
- **Fix**: Wait 24 hours or create new YouTube API key

### Audio transcription fails
- **Issue**: Missing FFmpeg
- **Fix**: Install FFmpeg (Docker images have it pre-installed)

### Tests fail
- **Issue**: Missing dependencies
- **Fix**: Run `pip install -r requirements.txt` and `npm install`

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:8000/docs (when backend is running)
- **Project Completion Report**: `ALL_PHASES_COMPLETE.md`
- **Architecture Guide**: `CONTRIBUTING.md`
- **GitHub Repository**: https://github.com/Nekofied007/stud

---

## 🎉 What's Next?

Your app is fully functional! Consider these optional enhancements:

### Phase 6: Advanced Features (Optional)
- Spaced repetition system (Anki-style flashcards)
- Progress tracking dashboard with charts
- Collaborative learning (study groups)
- Notes & annotations
- Offline mode (PWA)
- Mobile apps (React Native)

### Phase 7: Content Expansion (Optional)
- Support for Coursera, Udemy, Khan Academy
- PDF textbook support
- Live classes integration
- Instructor dashboard

### Phase 8: Monetization (Optional)
- Freemium model (5 free playlists)
- Premium subscriptions
- B2B licensing for schools
- API access for developers

---

## 💡 Tips for Success

1. **Start Small**: Import a short playlist (5-10 videos) first to test
2. **Monitor Usage**: Check OpenAI API usage to avoid unexpected costs
3. **Backup Data**: Regularly backup your SQLite database or configure PostgreSQL backups
4. **Update Dependencies**: Run `pip install --upgrade -r requirements.txt` periodically
5. **Check Logs**: Use `docker-compose logs -f` to monitor application health
6. **Secure Secrets**: Never commit `.env` files to Git

---

## 🆘 Need Help?

- **Issues**: https://github.com/Nekofied007/stud/issues
- **Documentation**: Check `ALL_PHASES_COMPLETE.md` for detailed feature explanations
- **API Errors**: Check `http://localhost:8000/docs` for endpoint documentation

---

**Happy Learning! 🎓✨**

Built with ❤️ using FastAPI, React, OpenAI, and lots of coffee ☕
