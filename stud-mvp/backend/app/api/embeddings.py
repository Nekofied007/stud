"""
API endpoints for embedding and RAG operations
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Optional
from pathlib import Path
from app.core.config import settings
from app.services.embeddings import process_transcript_for_rag, EmbeddingService
import json


router = APIRouter(prefix="/api/v1/embed", tags=["embeddings"])


@router.post("/video/{video_id}", status_code=202)
async def embed_video_transcript(
    video_id: str,
    background_tasks: BackgroundTasks
):
    """
    Generate embeddings for a video transcript
    
    Process:
    1. Load transcript
    2. Chunk into optimal sizes (800 tokens max)
    3. Generate embeddings using OpenAI
    4. Store in vector database
    
    Returns 202 Accepted - processing in background
    """
    try:
        # Add to background tasks
        background_tasks.add_task(process_transcript_for_rag, video_id)
        
        return {
            "status": "processing",
            "video_id": video_id,
            "message": "Embedding generation started in background"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}")
async def get_embedded_chunks(video_id: str):
    """
    Retrieve embedded chunks for a video
    
    Returns:
    - video_id
    - chunks: List of chunks with embeddings
    - total_chunks
    - avg_tokens
    """
    embeddings_dir = Path(settings.storage_path) / "embeddings"
    embeddings_file = embeddings_dir / f"{video_id}.json"
    
    if not embeddings_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Embeddings not found for video: {video_id}"
        )
    
    try:
        with open(embeddings_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        total_tokens = sum(c.get("tokens", 0) for c in chunks)
        avg_tokens = total_tokens / len(chunks) if chunks else 0
        
        return {
            "video_id": video_id,
            "chunks": chunks,
            "total_chunks": len(chunks),
            "avg_tokens": round(avg_tokens, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{video_id}")
async def get_embedding_status(video_id: str):
    """
    Check if embeddings exist for a video
    
    Returns:
    - status: "completed" or "not_started"
    - video_id
    """
    embeddings_dir = Path(settings.storage_path) / "embeddings"
    embeddings_file = embeddings_dir / f"{video_id}.json"
    
    if embeddings_file.exists():
        return {
            "status": "completed",
            "video_id": video_id
        }
    else:
        return {
            "status": "not_started",
            "video_id": video_id
        }


@router.post("/search")
async def search_similar_chunks(
    query: str,
    video_id: Optional[str] = None,
    top_k: int = 5
):
    """
    Search for similar chunks using semantic similarity
    
    Args:
    - query: User's search query
    - video_id: Optional - limit search to specific video
    - top_k: Number of results to return (default: 5)
    
    Returns:
    - query
    - results: List of similar chunks with similarity scores
    
    Note: This is a basic implementation for MVP
    Production should use Weaviate's native vector search
    """
    try:
        # Generate embedding for query
        embedding_service = EmbeddingService()
        query_embedding = await embedding_service.generate_embedding(query)
        
        # Load chunks from storage
        embeddings_dir = Path(settings.storage_path) / "embeddings"
        
        if not embeddings_dir.exists():
            return {
                "query": query,
                "results": [],
                "message": "No embeddings found in storage"
            }
        
        all_chunks = []
        
        if video_id:
            # Search specific video
            embeddings_file = embeddings_dir / f"{video_id}.json"
            if embeddings_file.exists():
                with open(embeddings_file, 'r', encoding='utf-8') as f:
                    chunks = json.load(f)
                    all_chunks.extend(chunks)
        else:
            # Search all videos
            for embeddings_file in embeddings_dir.glob("*.json"):
                with open(embeddings_file, 'r', encoding='utf-8') as f:
                    chunks = json.load(f)
                    all_chunks.extend(chunks)
        
        # Compute cosine similarity
        import numpy as np
        
        similarities = []
        for chunk in all_chunks:
            chunk_embedding = chunk.get("embedding")
            if not chunk_embedding:
                continue
            
            # Cosine similarity
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )
            
            similarities.append({
                "video_id": chunk["video_id"],
                "chunk_index": chunk["chunk_index"],
                "text": chunk["text"],
                "start": chunk["start"],
                "end": chunk["end"],
                "similarity": float(similarity)
            })
        
        # Sort by similarity and return top K
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        top_results = similarities[:top_k]
        
        return {
            "query": query,
            "results": top_results,
            "total_searched": len(all_chunks)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
