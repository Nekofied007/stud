"""
Unit tests for chunking and embedding services
"""
import pytest
from app.services.embeddings import ChunkingService, EmbeddingService
from app.models.schemas import TranscriptData, TranscriptChunk


def test_count_tokens():
    """Test token counting with tiktoken"""
    chunking = ChunkingService(max_tokens=800)
    
    # Simple text
    text = "Hello world"
    tokens = chunking.count_tokens(text)
    assert tokens > 0
    assert tokens < 10  # "Hello world" should be 2-3 tokens
    
    # Longer text
    long_text = "This is a longer text. " * 100
    long_tokens = chunking.count_tokens(long_text)
    assert long_tokens > tokens


def test_merge_small_chunks():
    """Test merging small transcript chunks"""
    chunking = ChunkingService(max_tokens=800)
    
    # Create small chunks
    chunks = [
        TranscriptChunk(start=0.0, end=5.0, text="First sentence."),
        TranscriptChunk(start=5.0, end=10.0, text="Second sentence."),
        TranscriptChunk(start=10.0, end=15.0, text="Third sentence."),
    ]
    
    merged = chunking.merge_small_chunks(chunks)
    
    # Should merge into fewer chunks
    assert len(merged) <= len(chunks)
    
    # Each chunk should have required fields
    for chunk in merged:
        assert "start" in chunk
        assert "end" in chunk
        assert "text" in chunk
        assert "tokens" in chunk
        assert chunk["tokens"] <= 800


def test_chunk_transcript():
    """Test full transcript chunking"""
    chunking = ChunkingService(max_tokens=800)
    
    # Create sample transcript
    transcript = TranscriptData(
        video_id="test001",
        transcript=[
            TranscriptChunk(start=0.0, end=5.0, text="Hello and welcome to this tutorial."),
            TranscriptChunk(start=5.0, end=10.0, text="Today we'll learn about Python."),
            TranscriptChunk(start=10.0, end=15.0, text="Python is a powerful programming language."),
        ]
    )
    
    chunks = chunking.chunk_transcript(transcript)
    
    # Should return list of dicts
    assert isinstance(chunks, list)
    assert len(chunks) > 0
    
    # Each chunk should have metadata
    for i, chunk in enumerate(chunks):
        assert chunk["video_id"] == "test001"
        assert chunk["chunk_index"] == i
        assert "start" in chunk
        assert "end" in chunk
        assert "text" in chunk
        assert "tokens" in chunk
        assert chunk["tokens"] <= 800


def test_chunk_preserves_timestamps():
    """Test that chunking preserves start/end timestamps"""
    chunking = ChunkingService(max_tokens=800)
    
    transcript = TranscriptData(
        video_id="test002",
        transcript=[
            TranscriptChunk(start=0.0, end=5.0, text="First."),
            TranscriptChunk(start=5.0, end=10.0, text="Second."),
        ]
    )
    
    chunks = chunking.chunk_transcript(transcript)
    
    # First chunk should start at 0.0
    assert chunks[0]["start"] == 0.0
    
    # Last chunk should end at 10.0
    assert chunks[-1]["end"] == 10.0


def test_large_chunk_not_split():
    """Test that chunks near max_tokens are not artificially split"""
    chunking = ChunkingService(max_tokens=800)
    
    # Create chunk with ~500 tokens
    long_text = "This is a sample sentence that will be repeated many times. " * 50
    
    transcript = TranscriptData(
        video_id="test003",
        transcript=[
            TranscriptChunk(start=0.0, end=30.0, text=long_text),
        ]
    )
    
    chunks = chunking.chunk_transcript(transcript)
    
    # Should keep as single chunk if under 800 tokens
    tokens = chunking.count_tokens(long_text)
    if tokens <= 800:
        assert len(chunks) == 1


@pytest.mark.asyncio
async def test_embedding_service_initialization():
    """Test that EmbeddingService initializes correctly"""
    # This will fail if OPENAI_API_KEY is not set
    # That's expected in testing environment
    try:
        service = EmbeddingService()
        assert service.model == "text-embedding-3-small"
    except ValueError as e:
        # Expected if no API key
        assert "OPENAI_API_KEY" in str(e)


def test_chunk_boundary_handling():
    """Test handling of chunk boundaries and edge cases"""
    chunking = ChunkingService(max_tokens=50)  # Small max for testing
    
    # Create chunks that will need merging
    chunks = [
        TranscriptChunk(start=0.0, end=2.0, text="A"),
        TranscriptChunk(start=2.0, end=4.0, text="B"),
        TranscriptChunk(start=4.0, end=6.0, text="C"),
    ]
    
    merged = chunking.merge_small_chunks(chunks)
    
    # Should merge all into one chunk (very small texts)
    assert len(merged) == 1
    assert merged[0]["text"] == "A B C"
    assert merged[0]["start"] == 0.0
    assert merged[0]["end"] == 6.0


def test_empty_transcript():
    """Test handling of empty transcript"""
    chunking = ChunkingService(max_tokens=800)
    
    transcript = TranscriptData(
        video_id="test004",
        transcript=[]
    )
    
    chunks = chunking.chunk_transcript(transcript)
    
    # Should return empty list
    assert chunks == []
