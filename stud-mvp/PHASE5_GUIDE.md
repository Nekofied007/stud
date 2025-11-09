# Phase 5: Testing & CI/CD - Implementation Guide

**Status**: 🚧 **READY FOR IMPLEMENTATION**  
**Priority**: HIGH (Required for production quality)  
**Estimated Time**: 3-4 days

---

## Overview

This phase implements comprehensive testing and continuous integration/deployment pipelines. It includes unit tests, integration tests, E2E tests, and automated deployment workflows.

## Testing Strategy

### Test Pyramid

```
        /\
       /E2E\          10% - Critical user flows
      /------\
     /  INT   \       30% - API integration tests  
    /----------\
   /   UNIT     \     60% - Component/function tests
  /--------------\
```

---

## Backend Testing (Python/pytest)

### Current Status ✅

**46 tests passing** covering:
- Playlist ingestion
- Transcription pipeline
- Quiz generation
- AI Tutor RAG system

### Additional Tests Needed

**File: `tests/test_auth.py`** (TODO)
```python
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth import create_access_token

client = TestClient(app)

def test_register_success():
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepassword123",
        "full_name": "New User"
    })
    assert response.status_code == 200
    assert "user_id" in response.json()

def test_register_duplicate_email():
    # Register once
    client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "Duplicate User"
    })
    # Try again
    response = client.post("/api/v1/auth/register", json={
        "email": "duplicate@example.com",
        "password": "password456",
        "full_name": "Another User"
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]

def test_login_success():
    # First register
    client.post("/api/v1/auth/register", json={
        "email": "loginuser@example.com",
        "password": "password123",
        "full_name": "Login User"
    })
    # Then login
    response = client.post("/api/v1/auth/login", data={
        "username": "loginuser@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_wrong_password():
    response = client.post("/api/v1/auth/login", data={
        "username": "loginuser@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

def test_get_current_user():
    token = create_access_token(data={"sub": "loginuser@example.com"})
    response = client.get("/api/v1/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "loginuser@example.com"

def test_protected_endpoint_no_token():
    response = client.get("/api/v1/ingest/playlists")
    assert response.status_code == 401

def test_protected_endpoint_invalid_token():
    response = client.get("/api/v1/ingest/playlists", headers={
        "Authorization": "Bearer invalidtoken123"
    })
    assert response.status_code == 401

def test_protected_endpoint_with_token():
    token = create_access_token(data={"sub": "loginuser@example.com"})
    response = client.get("/api/v1/ingest/playlists", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
```

**Run Backend Tests:**
```bash
cd backend
pytest tests/ -v --cov=backend --cov-report=html
```

---

## Frontend Testing (React/Vitest)

### Unit Tests

**File: `frontend/src/components/ui/__tests__/LoadingSpinner.test.tsx`** (TODO)
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('⏳')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByText('⏳').parentElement).toHaveClass('text-2xl')
    
    rerender(<LoadingSpinner size="xl" />)
    expect(screen.getByText('⏳').parentElement).toHaveClass('text-6xl')
  })
})
```

**File: `frontend/src/hooks/__tests__/usePlaylists.test.ts`** (TODO)
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from 'react-query'
import { usePlaylists } from '../usePlaylists'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePlaylists', () => {
  it('fetches playlists successfully', async () => {
    const { result } = renderHook(() => usePlaylists(), {
      wrapper: createWrapper()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeDefined()
  })
})
```

**Setup Vitest:**

**File: `frontend/vite.config.js`** (UPDATE)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/tests/']
    }
  }
})
```

**File: `frontend/src/tests/setup.ts`** (TODO)
```typescript
import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})
```

**Run Frontend Tests:**
```bash
cd frontend
npm run test
npm run test:coverage
```

---

## E2E Testing (Playwright)

### Setup

**File: `tests/e2e/playwright.config.ts`** (TODO)
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### E2E Test: Complete User Flow

**File: `tests/e2e/user-flow.spec.ts`** (TODO)
```typescript
import { test, expect } from '@playwright/test'

test('complete learning flow', async ({ page }) => {
  // 1. Register
  await page.goto('/register')
  await page.fill('input[type="email"]', 'testuser@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.fill('input[name="fullName"]', 'Test User')
  await page.click('button[type="submit"]')

  // 2. Import playlist
  await expect(page).toHaveURL('/courses')
  await page.fill('input[placeholder*="YouTube"]', 'https://youtube.com/playlist?list=PLtest')
  await page.click('button:has-text("Import")')
  await expect(page.locator('text=Successfully imported')).toBeVisible()

  // 3. View course
  await page.click('text=Test Playlist Title')
  await expect(page).toHaveURL(/\/courses\/[\w-]+/)
  await expect(page.locator('h1')).toContainText('Test Playlist Title')

  // 4. Watch lesson
  await page.click('text=Lesson 1')
  await expect(page).toHaveURL(/\/lessons\/[\w-]+/)
  await expect(page.locator('iframe')).toBeVisible()

  // 5. Generate transcript
  await page.click('button:has-text("Generate Transcript")')
  await expect(page.locator('text=Transcribing')).toBeVisible()
  await page.waitForSelector('text=Transcribing', { state: 'hidden', timeout: 60000 })
  await expect(page.locator('.transcript-segment').first()).toBeVisible()

  // 6. Take quiz
  await page.click('button:has-text("Take Quiz")')
  await expect(page).toHaveURL(/\/quiz/)
  await page.click('label:has-text("Option A")')
  await page.click('button:has-text("Submit Answer")')
  await expect(page.locator('text=Correct')).toBeVisible()

  // 7. Ask tutor
  await page.click('button:has-text("Ask Tutor")')
  await expect(page).toHaveURL(/\/tutor/)
  await page.fill('input[placeholder*="question"]', 'What is the main topic?')
  await page.click('button:has-text("Send")')
  await expect(page.locator('.assistant-message').first()).toBeVisible({ timeout: 30000 })
})

test('error handling', async ({ page }) => {
  await page.goto('/login')
  
  // Wrong password
  await page.fill('input[type="email"]', 'testuser@example.com')
  await page.fill('input[type="password"]', 'wrongpassword')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Invalid email or password')).toBeVisible()

  // Invalid playlist URL
  await page.goto('/courses')
  await page.fill('input[placeholder*="YouTube"]', 'invalid-url')
  await page.click('button:has-text("Import")')
  await expect(page.locator('text=Invalid URL')).toBeVisible()
})
```

**Run E2E Tests:**
```bash
npx playwright test
npx playwright test --ui  # Interactive mode
npx playwright show-report  # View results
```

---

## CI/CD Pipeline (GitHub Actions)

### Workflow: Test & Build

**File: `.github/workflows/ci.yml`** (TODO)
```yaml
name: CI - Test & Build

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest tests/ -v --cov=backend --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
          flags: backend

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./frontend/coverage/coverage-final.json
          flags: frontend

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  build-docker:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Build backend image
        run: docker build -t stud-backend:latest ./backend
      
      - name: Build frontend image
        run: docker build -t stud-frontend:latest ./frontend
```

### Workflow: Deploy to Staging

**File: `.github/workflows/deploy-staging.yml`** (TODO)
```yaml
name: Deploy to Staging

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend
        run: |
          docker build -t $ECR_REGISTRY/stud-backend:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/stud-backend:$IMAGE_TAG
      
      - name: Build and push frontend
        run: |
          docker build -t $ECR_REGISTRY/stud-frontend:$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/stud-frontend:$IMAGE_TAG
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster stud-staging --service stud-backend --force-new-deployment
          aws ecs update-service --cluster stud-staging --service stud-frontend --force-new-deployment
```

### Workflow: Deploy to Production

**File: `.github/workflows/deploy-production.yml`** (TODO)
```yaml
name: Deploy to Production

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      # Similar to staging but with production environment
      # Add manual approval step
      - name: Wait for approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ github.TOKEN }}
          approvers: user1,user2
```

---

## Docker Production Build

### Backend Dockerfile

**File: `backend/Dockerfile.prod`** (TODO)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run with gunicorn
CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Frontend Dockerfile

**File: `frontend/Dockerfile.prod`** (TODO)
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Production

**File: `docker-compose.prod.yml`** (TODO)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/stud
      - SECRET_KEY=${SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=stud
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

  redis:
    image: redis:7-alpine
    restart: always

volumes:
  postgres_data:
```

---

## Monitoring & Logging

### Setup Sentry

**Backend: `backend/main.py`** (UPDATE)
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "development")
)
```

**Frontend: `frontend/src/main.js`** (UPDATE)
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE
});
```

### Setup Logging

**Backend: `backend/logger.py`** (TODO)
```python
import logging
import sys

def setup_logger():
    logger = logging.getLogger("stud")
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

logger = setup_logger()
```

---

## Performance Testing

### Load Testing with Locust

**File: `tests/load/locustfile.py`** (TODO)
```python
from locust import HttpUser, task, between

class STUDUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        # Login
        response = self.client.post("/api/v1/auth/login", data={
            "username": "testuser@example.com",
            "password": "password123"
        })
        self.token = response.json()["access_token"]
    
    @task(3)
    def view_courses(self):
        self.client.get("/api/v1/ingest/playlists", headers={
            "Authorization": f"Bearer {self.token}"
        })
    
    @task(2)
    def view_transcript(self):
        self.client.get("/api/v1/transcribe/video/test123", headers={
            "Authorization": f"Bearer {self.token}"
        })
    
    @task(1)
    def ask_tutor(self):
        self.client.post("/api/v1/tutor/ask", json={
            "question": "What is the main topic?",
            "video_id": "test123",
            "session_id": "session123"
        }, headers={
            "Authorization": f"Bearer {self.token}"
        })
```

**Run Load Tests:**
```bash
locust -f tests/load/locustfile.py --host=http://localhost:8000
# Open http://localhost:8089
```

---

## Deployment Checklist

- [ ] All tests passing (backend, frontend, E2E)
- [ ] Code coverage > 80%
- [ ] Docker images built successfully
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] CDN configured for static assets
- [ ] Monitoring dashboard set up (Sentry, CloudWatch)
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Rollback plan documented

---

**Status**: Framework ready, implementation pending  
**Estimated Completion**: 3-4 days of focused work  
**Dependencies**: Phase 4 (Auth) should be completed first
