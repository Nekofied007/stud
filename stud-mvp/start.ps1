# Quick Start Script for STUD MVP

Write-Host "🚀 Starting STUD MVP..." -ForegroundColor Cyan

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit .env with your API keys before continuing!" -ForegroundColor Red
    Write-Host "   Required: YOUTUBE_API_KEY, OPENAI_API_KEY" -ForegroundColor Red
    exit 1
}

# Check Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Stop existing containers
Write-Host "`n🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Build and start services
Write-Host "`n🔨 Building and starting services..." -ForegroundColor Cyan
docker-compose up -d --build

# Wait for services to be healthy
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check backend health
Write-Host "`n🏥 Checking backend health..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✅ Backend is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend health check failed. Check logs with: docker-compose logs backend" -ForegroundColor Yellow
}

# Check frontend
Write-Host "`n🌐 Checking frontend..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not ready yet. Check logs with: docker-compose logs frontend" -ForegroundColor Yellow
}

Write-Host "`n" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 STUD MVP is starting up!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:   http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "🗄️  Postgres:  localhost:5432" -ForegroundColor Cyan
Write-Host "🔴 Redis:     localhost:6379" -ForegroundColor Cyan
Write-Host "🔍 Weaviate:  http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "View logs: docker compose logs -f" -ForegroundColor Yellow
Write-Host "Stop services: docker compose down" -ForegroundColor Yellow
Write-Host ""
