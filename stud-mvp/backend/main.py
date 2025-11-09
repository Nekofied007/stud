"""
STUD Backend - FastAPI Application
Main entry point for the STUD API server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

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
