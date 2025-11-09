"""
Chunking and embedding service for transcript processing
Prepares transcript chunks for RAG-based AI tutor
"""
import tiktoken
from typing import List, Dict
from pathlib import Path
import json
import openai
from app.core.config import settings
from app.models.schemas import TranscriptData, TranscriptChunk


class ChunkingService:
    """Service for chunking transcripts into semantic units"""
    
    def __init__(self, max_tokens: int = 800):
        self.max_tokens = max_tokens
        self.encoding = tiktoken.get_encoding("cl100k_base")  # GPT-4 encoding
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text using tiktoken"""
        return len(self.encoding.encode(text))
    
    def merge_small_chunks(self, chunks: List[TranscriptChunk]) -> List[Dict]:
        """
        Merge consecutive small transcript chunks to reach optimal size
        Target: 200-800 tokens per chunk
        Preserves start/end timestamps
        """
        merged_chunks = []
        current_chunk = None
        
        for chunk in chunks:
            if current_chunk is None:
                current_chunk = {
                    "start": chunk.start,
                    "end": chunk.end,
                    "text": chunk.text,
                    "tokens": self.count_tokens(chunk.text)
                }
            else:
                # Try to merge
                combined_text = current_chunk["text"] + " " + chunk.text
                combined_tokens = self.count_tokens(combined_text)
                
                if combined_tokens <= self.max_tokens:
                    # Merge
                    current_chunk["text"] = combined_text
                    current_chunk["end"] = chunk.end
                    current_chunk["tokens"] = combined_tokens
                else:
                    # Save current and start new
                    merged_chunks.append(current_chunk)
                    current_chunk = {
                        "start": chunk.start,
                        "end": chunk.end,
                        "text": chunk.text,
                        "tokens": self.count_tokens(chunk.text)
                    }
        
        # Add last chunk
        if current_chunk:
            merged_chunks.append(current_chunk)
        
        return merged_chunks
    
    def chunk_transcript(self, transcript_data: TranscriptData) -> List[Dict]:
        """
        Main method: Chunk transcript into optimal-sized segments
        
        Returns list of dicts with:
        - video_id
        - chunk_index
        - start (seconds)
        - end (seconds)
        - text
        - tokens
        """
        merged = self.merge_small_chunks(transcript_data.transcript)
        
        chunked_data = []
        for i, chunk in enumerate(merged):
            chunked_data.append({
                "video_id": transcript_data.video_id,
                "chunk_index": i,
                "start": chunk["start"],
                "end": chunk["end"],
                "text": chunk["text"],
                "tokens": chunk["tokens"]
            })
        
        return chunked_data


class EmbeddingService:
    """Service for generating embeddings using OpenAI"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")
        openai.api_key = self.api_key
        self.model = "text-embedding-3-small"  # OpenAI's latest efficient model
    
    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        Returns 1536-dimensional vector (text-embedding-3-small)
        """
        response = await openai.embeddings.acreate(
            model=self.model,
            input=text
        )
        return response.data[0].embedding
    
    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch
        OpenAI allows up to 2048 texts per request
        """
        if not texts:
            return []
        
        # Split into batches of 2048
        batch_size = 2048
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            response = await openai.embeddings.acreate(
                model=self.model,
                input=batch
            )
            batch_embeddings = [item.embedding for item in response.data]
            all_embeddings.extend(batch_embeddings)
        
        return all_embeddings
    
    async def embed_chunks(self, chunks: List[Dict]) -> List[Dict]:
        """
        Generate embeddings for all chunks
        Adds 'embedding' field to each chunk dict
        """
        texts = [chunk["text"] for chunk in chunks]
        embeddings = await self.generate_embeddings_batch(texts)
        
        for chunk, embedding in zip(chunks, embeddings):
            chunk["embedding"] = embedding
        
        return chunks
    
    def save_embedded_chunks(self, chunks: List[Dict], video_id: str):
        """Save chunks with embeddings to JSON file"""
        output_dir = Path(settings.storage_path) / "embeddings"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"{video_id}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, indent=2)
        
        print(f"✅ Saved {len(chunks)} embedded chunks to: {output_file}")


class VectorStoreService:
    """Service for storing and retrieving embeddings from Weaviate"""
    
    def __init__(self):
        # TODO: Initialize Weaviate client
        # import weaviate
        # self.client = weaviate.Client(url=settings.vector_db_url)
        pass
    
    def create_schema(self):
        """
        Create Weaviate schema for transcript chunks
        
        Schema:
        - TranscriptChunk class
        - Properties: video_id, chunk_index, start, end, text, tokens
        - Vector index on text embeddings
        """
        # TODO: Implement Weaviate schema creation
        pass
    
    async def index_chunks(self, chunks: List[Dict]):
        """
        Index chunks into Weaviate vector database
        
        For MVP: Just save to JSON (already done in save_embedded_chunks)
        For Production: Store in Weaviate with vector index
        """
        # TODO: Implement Weaviate indexing
        # For now, embeddings are saved to JSON files
        print(f"⏳ Vector DB indexing not yet implemented. Using JSON storage.")
        pass
    
    async def search_similar_chunks(self, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        """
        Search for similar chunks using vector similarity
        
        For MVP: Load from JSON and compute cosine similarity
        For Production: Use Weaviate's native vector search
        """
        # TODO: Implement similarity search
        pass


# Combined pipeline
async def process_transcript_for_rag(video_id: str):
    """
    Complete pipeline: Transcript → Chunks → Embeddings → Vector DB
    
    Steps:
    1. Load transcript
    2. Chunk into optimal sizes
    3. Generate embeddings
    4. Store in vector DB
    """
    from app.services.transcription import TranscriptionService
    
    # Load transcript
    transcription_service = TranscriptionService()
    transcript = transcription_service.load_transcript(video_id)
    
    if not transcript:
        raise ValueError(f"Transcript not found for video: {video_id}")
    
    print(f"📄 Processing transcript for {video_id}")
    print(f"   Original chunks: {len(transcript.transcript)}")
    
    # Chunk transcript
    chunking_service = ChunkingService(max_tokens=800)
    chunks = chunking_service.chunk_transcript(transcript)
    print(f"   Merged chunks: {len(chunks)}")
    
    total_tokens = sum(c["tokens"] for c in chunks)
    avg_tokens = total_tokens / len(chunks) if chunks else 0
    print(f"   Total tokens: {total_tokens}")
    print(f"   Avg tokens/chunk: {avg_tokens:.0f}")
    
    # Generate embeddings
    embedding_service = EmbeddingService()
    embedded_chunks = await embedding_service.embed_chunks(chunks)
    print(f"   Generated {len(embedded_chunks)} embeddings")
    
    # Save to JSON
    embedding_service.save_embedded_chunks(embedded_chunks, video_id)
    
    # Index in vector DB (TODO for production)
    vector_store = VectorStoreService()
    await vector_store.index_chunks(embedded_chunks)
    
    print(f"✅ RAG processing complete for {video_id}")
    return embedded_chunks


# CLI interface
if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python embeddings.py <video_id>")
        print("Example: python embeddings.py sample001")
        sys.exit(1)
    
    video_id = sys.argv[1]
    
    async def main():
        chunks = await process_transcript_for_rag(video_id)
        print(f"\nFirst chunk preview:")
        print(f"  Text: {chunks[0]['text'][:100]}...")
        print(f"  Tokens: {chunks[0]['tokens']}")
        print(f"  Embedding dim: {len(chunks[0]['embedding'])}")
    
    asyncio.run(main())
