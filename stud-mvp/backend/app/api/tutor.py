"""
API endpoints for AI Tutor (RAG-based question answering)
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ai_tutor import AITutorService
from app.models.schemas import TutorResponse


router = APIRouter(prefix="/api/v1/tutor", tags=["tutor"])


class AskQuestionRequest(BaseModel):
    """Request model for asking a question"""
    question: str
    video_id: Optional[str] = None
    session_id: Optional[str] = None
    top_k: int = 5
    context_window: int = 3


class FeedbackRequest(BaseModel):
    """Request model for providing feedback on an answer"""
    session_id: str
    question_index: int  # Index in conversation history
    rating: int  # 1-5 stars
    comment: Optional[str] = None


@router.post("/ask")
async def ask_question(request: AskQuestionRequest):
    """
    Ask the AI tutor a question
    
    Process:
    1. Embed the question
    2. Retrieve relevant chunks from video(s)
    3. Generate answer using GPT-4 + RAG
    4. Return answer with source citations and timestamps
    5. Save to conversation history
    
    Args:
        question: User's question
        video_id: Optional - limit to specific video
        session_id: Optional - conversation session ID (generated if not provided)
        top_k: Number of chunks to retrieve (default: 5)
        context_window: Number of previous messages to include (default: 3)
    
    Returns:
        TutorResponse with answer, sources, confidence, and suggestions
    """
    try:
        if not request.question or len(request.question.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Question must be at least 3 characters long"
            )
        
        tutor = AITutorService()
        response = await tutor.ask_question(
            question=request.question,
            video_id=request.video_id,
            session_id=request.session_id,
            top_k=request.top_k,
            context_window=request.context_window
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_conversation_history(session_id: str):
    """
    Get conversation history for a session
    
    Returns:
        List of Q&A pairs with timestamps and confidence scores
    """
    try:
        tutor = AITutorService()
        history = tutor.get_conversation_history(session_id)
        
        return {
            "session_id": session_id,
            "total_messages": len(history),
            "history": history
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/history/{session_id}")
async def clear_conversation_history(session_id: str):
    """
    Clear conversation history for a session
    
    Useful for starting a new topic or resetting context
    """
    try:
        tutor = AITutorService()
        tutor.clear_conversation_history(session_id)
        
        return {
            "session_id": session_id,
            "message": "Conversation history cleared"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Submit feedback on a tutor answer
    
    Allows users to rate answers (1-5 stars) and provide comments.
    This data can be used to improve the tutor over time.
    
    Args:
        session_id: Conversation session ID
        question_index: Index of Q&A in history (0-based)
        rating: 1-5 stars
        comment: Optional feedback comment
    """
    try:
        if not (1 <= feedback.rating <= 5):
            raise HTTPException(
                status_code=400,
                detail="Rating must be between 1 and 5"
            )
        
        # TODO: Store feedback in database for analytics
        # For MVP, just acknowledge receipt
        
        return {
            "session_id": feedback.session_id,
            "question_index": feedback.question_index,
            "rating": feedback.rating,
            "message": "Feedback received. Thank you!"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/suggest/{video_id}")
async def suggest_questions(video_id: str, count: int = 5):
    """
    Suggest questions a student might ask about a video
    
    Uses the video's transcript to generate relevant questions.
    Useful for guiding student exploration.
    
    Args:
        video_id: ID of the video
        count: Number of suggestions (default: 5, max: 10)
    
    Returns:
        List of suggested questions
    """
    try:
        if count > 10:
            count = 10
        
        # TODO: Implement intelligent question generation based on transcript
        # For MVP, return generic starter questions
        
        generic_questions = [
            f"What is the main topic covered in this video?",
            f"Can you explain the key concepts from this video?",
            f"What are the most important points to remember?",
            f"How can I apply what I learned?",
            f"What are common mistakes related to this topic?",
            f"Can you give me a summary of this video?",
            f"What prerequisites do I need for this topic?",
            f"Are there any advanced concepts explained?",
            f"What real-world examples are mentioned?",
            f"How does this relate to other topics?"
        ]
        
        return {
            "video_id": video_id,
            "suggestions": generic_questions[:count]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{session_id}")
async def get_session_stats(session_id: str):
    """
    Get statistics for a tutoring session
    
    Returns:
        - Total questions asked
        - Average confidence score
        - Topics discussed (extracted from questions)
        - Session duration
    """
    try:
        tutor = AITutorService()
        history = tutor.get_conversation_history(session_id)
        
        if not history:
            raise HTTPException(
                status_code=404,
                detail=f"No history found for session: {session_id}"
            )
        
        # Calculate stats
        total_questions = len(history)
        avg_confidence = sum(h.get("confidence", 0) for h in history) / total_questions
        
        # Extract timestamps
        timestamps = [h.get("timestamp") for h in history if h.get("timestamp")]
        
        stats = {
            "session_id": session_id,
            "total_questions": total_questions,
            "average_confidence": round(avg_confidence, 2),
            "first_question": timestamps[0] if timestamps else None,
            "last_question": timestamps[-1] if timestamps else None
        }
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
