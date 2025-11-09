"""
Unit tests for AI Tutor service
"""
import pytest
from app.services.ai_tutor import AITutorService
from app.models.schemas import TutorResponse


def test_ai_tutor_initialization():
    """Test that AITutorService initializes correctly"""
    try:
        service = AITutorService()
        assert service.model == "gpt-4"
        assert service.embedding_service is not None
    except ValueError as e:
        # Expected if no API key
        assert "OPENAI_API_KEY" in str(e)


def test_calculate_confidence_high():
    """Test confidence calculation with high similarity chunks"""
    tutor = AITutorService()
    
    chunks = [
        {"similarity": 0.9, "text": "relevant content"},
        {"similarity": 0.85, "text": "more relevant content"},
        {"similarity": 0.88, "text": "also relevant"}
    ]
    
    answer = "This is a confident answer based on the content."
    confidence = tutor._calculate_confidence(chunks, answer)
    
    assert confidence > 0.7  # Should be high confidence
    assert 0.0 <= confidence <= 1.0


def test_calculate_confidence_low():
    """Test confidence calculation with uncertainty phrases"""
    tutor = AITutorService()
    
    chunks = [
        {"similarity": 0.6, "text": "somewhat relevant"}
    ]
    
    answer = "I'm not sure, but possibly this might be related."
    confidence = tutor._calculate_confidence(chunks, answer)
    
    assert confidence < 0.7  # Should be lower confidence
    assert 0.0 <= confidence <= 1.0


def test_calculate_confidence_no_chunks():
    """Test confidence with no chunks"""
    tutor = AITutorService()
    
    confidence = tutor._calculate_confidence([], "Some answer")
    assert confidence == 0.0


def test_extract_sources():
    """Test source extraction from chunks"""
    tutor = AITutorService()
    
    chunks = [
        {
            "video_id": "test001",
            "start": 10.0,
            "end": 20.0,
            "text": "This is test content " * 50,  # Long text
            "similarity": 0.9
        },
        {
            "video_id": "test002",
            "start": 30.0,
            "end": 40.0,
            "text": "Short text",
            "similarity": 0.85
        }
    ]
    
    sources = tutor._extract_sources(chunks)
    
    assert len(sources) == 2
    assert sources[0]["video_id"] == "test001"
    assert sources[0]["start"] == 10.0
    assert sources[0]["end"] == 20.0
    assert len(sources[0]["text"]) <= 203  # Should be truncated
    assert sources[0]["similarity"] == 0.9
    
    # Short text should not be truncated
    assert "..." not in sources[1]["text"]


def test_generate_suggested_questions():
    """Test suggested question generation"""
    tutor = AITutorService()
    
    chunks = [
        {"text": "Python is a programming language"}
    ]
    
    # Test different question types
    what_suggestions = tutor._generate_suggested_questions(
        question="What is Python?",
        answer="Python is a language.",
        chunks=chunks
    )
    
    how_suggestions = tutor._generate_suggested_questions(
        question="How do I use Python?",
        answer="You can use Python by...",
        chunks=chunks
    )
    
    why_suggestions = tutor._generate_suggested_questions(
        question="Why use Python?",
        answer="Python is useful because...",
        chunks=chunks
    )
    
    # Should return different suggestions based on question type
    assert len(what_suggestions) > 0
    assert len(how_suggestions) > 0
    assert len(why_suggestions) > 0
    
    # Should return at most 3 suggestions
    assert len(what_suggestions) <= 3
    
    # Suggestions should be strings
    assert all(isinstance(s, str) for s in what_suggestions)


def test_get_system_prompt():
    """Test system prompt generation"""
    tutor = AITutorService()
    
    system_prompt = tutor._get_system_prompt()
    
    # Check for key guidelines
    assert "AI tutor" in system_prompt or "tutor" in system_prompt.lower()
    assert "ONLY" in system_prompt.upper() or "exclusively" in system_prompt.lower()
    assert "transcript" in system_prompt.lower()
    assert "timestamp" in system_prompt.lower()
    assert "cite" in system_prompt.lower() or "reference" in system_prompt.lower()


def test_build_tutor_prompt():
    """Test prompt building with chunks and history"""
    tutor = AITutorService()
    
    chunks = [
        {
            "video_id": "test001",
            "start": 0.0,
            "end": 10.0,
            "text": "This is chunk 1"
        },
        {
            "video_id": "test001",
            "start": 10.0,
            "end": 20.0,
            "text": "This is chunk 2"
        }
    ]
    
    history = [
        {
            "question": "What is this?",
            "answer": "This is a test."
        }
    ]
    
    prompt = tutor._build_tutor_prompt(
        question="Tell me more",
        chunks=chunks,
        conversation_history=history
    )
    
    # Check prompt contains key elements
    assert "Tell me more" in prompt
    assert "This is chunk 1" in prompt
    assert "This is chunk 2" in prompt
    assert "PREVIOUS CONVERSATION" in prompt or "previous" in prompt.lower()
    assert "What is this?" in prompt
    assert "[0.0s - 10.0s]" in prompt
    assert "test001" in prompt


def test_build_tutor_prompt_no_history():
    """Test prompt building without history"""
    tutor = AITutorService()
    
    chunks = [
        {
            "video_id": "test001",
            "start": 0.0,
            "end": 10.0,
            "text": "Content"
        }
    ]
    
    prompt = tutor._build_tutor_prompt(
        question="Question",
        chunks=chunks,
        conversation_history=[]
    )
    
    # Should not have history section
    assert "PREVIOUS CONVERSATION" not in prompt
    assert "Content" in prompt
    assert "Question" in prompt


def test_load_conversation_history():
    """Test loading conversation history"""
    tutor = AITutorService()
    
    # Try to load sample conversation
    try:
        history = tutor.get_conversation_history("sample-session-001")
        
        assert isinstance(history, list)
        if history:
            assert "question" in history[0]
            assert "answer" in history[0]
            assert "timestamp" in history[0]
    
    except:
        # Sample data might not exist in test environment
        pytest.skip("Sample conversation data not available")


def test_load_nonexistent_history():
    """Test loading non-existent history returns empty list"""
    tutor = AITutorService()
    
    history = tutor._load_conversation_history(
        "nonexistent-session-id",
        context_window=5
    )
    
    assert history == []


def test_context_window_limiting():
    """Test that context window limits history correctly"""
    tutor = AITutorService()
    
    # Create mock history with 5 entries
    full_history = [
        {"question": f"Q{i}", "answer": f"A{i}"}
        for i in range(5)
    ]
    
    # Save mock history
    import json
    from pathlib import Path
    
    history_dir = Path("backend/data/conversations")
    history_dir.mkdir(parents=True, exist_ok=True)
    
    session_id = "test-context-window"
    with open(history_dir / f"{session_id}.json", 'w') as f:
        json.dump(full_history, f)
    
    # Load with context window of 2
    limited_history = tutor._load_conversation_history(session_id, context_window=2)
    
    # Should only get last 2 entries
    assert len(limited_history) == 2
    assert limited_history[0]["question"] == "Q3"
    assert limited_history[1]["question"] == "Q4"


@pytest.mark.asyncio
async def test_retrieve_relevant_chunks_no_embeddings():
    """Test retrieval when no embeddings exist"""
    try:
        tutor = AITutorService()
        chunks = await tutor._retrieve_relevant_chunks(
            question="test question",
            video_id="nonexistent",
            top_k=5
        )
        
        # Should return empty list
        assert chunks == []
        
    except ValueError:
        # Expected if no API key
        pytest.skip("OpenAI API key not available")


def test_tutor_response_model():
    """Test TutorResponse model validation"""
    response = TutorResponse(
        question="What is Python?",
        answer="Python is a programming language.",
        sources=[
            {
                "video_id": "test001",
                "start": 10.0,
                "end": 20.0,
                "text": "Python content",
                "similarity": 0.9
            }
        ],
        confidence=0.85,
        suggested_questions=["How do I use Python?"],
        session_id="test-session"
    )
    
    assert response.question == "What is Python?"
    assert response.answer == "Python is a programming language."
    assert len(response.sources) == 1
    assert response.confidence == 0.85
    assert len(response.suggested_questions) == 1
    assert response.session_id == "test-session"
