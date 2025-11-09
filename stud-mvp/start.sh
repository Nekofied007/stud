#!/bin/bash

# Quick Start Script for STUD MVP (Unix/Linux/Mac)

echo "🚀 Starting STUD MVP..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your API keys before continuing!"
    echo "   Required: YOUTUBE_API_KEY, OPENAI_API_KEY"
    exit 1
fi

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker."
    exit 1
fi
echo "✅ Docker is running"

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null

# Build and start services
echo ""
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check backend health
echo ""
echo "🏥 Checking backend health..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed. Check logs with: docker-compose logs backend"
fi

# Check frontend
echo ""
echo "🌐 Checking frontend..."
sleep 5
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "⚠️  Frontend not ready yet. Check logs with: docker-compose logs frontend"
fi

echo ""
echo "============================================================"
echo "🎉 STUD MVP is starting up!"
echo "============================================================"
echo ""
echo "📱 Frontend:  http://localhost:3000"
echo "🔧 Backend:   http://localhost:8000"
echo "📚 API Docs:  http://localhost:8000/docs"
echo "🗄️  Postgres:  localhost:5432"
echo "🔴 Redis:     localhost:6379"
echo "🔍 Weaviate:  http://localhost:8080"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
