"""
STUD Backend - FastAPI Application
Main entry point for the STUD API server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import sys
from pathlib import Path

# Add app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.api import ingest, transcribe, embeddings, quiz, tutor

# Initialize FastAPI app
app = FastAPI(
    title="STUD API",
    description="Backend API for Studying Till Unlocking Dreams platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingest.router)
app.include_router(transcribe.router)
app.include_router(embeddings.router)
app.include_router(quiz.router)
app.include_router(tutor.router)

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    Returns 200 OK with service status
    """
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "version": "0.1.0",
            "service": "stud-backend"
        }
    )

@app.get("/")
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "STUD API - Studying Till Unlocking Dreams",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
