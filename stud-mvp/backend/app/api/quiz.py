"""
API endpoints for quiz generation and management
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
from app.core.config import settings
from app.services.quiz_generator import QuizGeneratorService
from app.models.schemas import QuizData


router = APIRouter(prefix="/api/v1/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    """Request model for quiz generation"""
    num_questions: int = 5
    difficulty: str = "mixed"  # "beginner", "intermediate", "advanced", "mixed"


class QuizReviewRequest(BaseModel):
    """Request model for marking a question as reviewed"""
    reviewed: bool
    reviewer_notes: Optional[str] = None


@router.post("/video/{video_id}", status_code=202)
async def generate_quiz(
    video_id: str,
    request: QuizGenerateRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate a quiz for a video
    
    Process:
    1. Load embedded chunks from video
    2. Use GPT-4 to generate multiple-choice questions
    3. Validate questions (4 options, 1 correct answer)
    4. Flag questions that need human review
    5. Save quiz to storage
    
    Returns 202 Accepted - processing in background
    
    Requirements:
    - Video must have embeddings generated first
    - OpenAI API key must be configured
    """
    try:
        # Verify embeddings exist
        embeddings_dir = Path(settings.storage_path) / "embeddings"
        embeddings_file = embeddings_dir / f"{video_id}.json"
        
        if not embeddings_file.exists():
            raise HTTPException(
                status_code=404,
                detail=f"Embeddings not found for video: {video_id}. Generate embeddings first."
            )
        
        # Add to background tasks
        async def generate_task():
            generator = QuizGeneratorService()
            await generator.generate_quiz(
                video_id=video_id,
                num_questions=request.num_questions,
                difficulty=request.difficulty
            )
        
        background_tasks.add_task(generate_task)
        
        return {
            "status": "processing",
            "video_id": video_id,
            "num_questions": request.num_questions,
            "message": "Quiz generation started in background"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/video/{video_id}")
async def get_quiz(video_id: str, include_answers: bool = False):
    """
    Retrieve quiz for a video
    
    Args:
        video_id: ID of the video
        include_answers: Include correct answers and explanations (default: False)
                        Set to True for instructor view, False for student view
    
    Returns:
        QuizData with questions (optionally without answers for students)
    """
    try:
        generator = QuizGeneratorService()
        quiz = generator.load_quiz(video_id)
        
        # Convert to dict
        quiz_dict = {
            "video_id": quiz.video_id,
            "total_questions": len(quiz.questions),
            "questions": []
        }
        
        for i, q in enumerate(quiz.questions):
            question_dict = {
                "question_id": i,
                "question": q.question,
                "options": q.options,
                "difficulty": q.difficulty,
                "timestamp_reference": q.timestamp_reference
            }
            
            # Include answers only if requested (instructor view)
            if include_answers:
                question_dict["correct_index"] = q.correct_index
                question_dict["explanation"] = q.explanation
                question_dict["requires_review"] = q.requires_review
            
            quiz_dict["questions"].append(question_dict)
        
        return quiz_dict
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{video_id}")
async def get_quiz_status(video_id: str):
    """
    Check if quiz exists for a video
    
    Returns:
        - status: "completed", "not_started"
        - video_id
        - total_questions (if completed)
        - needs_review (if completed)
    """
    quizzes_dir = Path(settings.storage_path) / "quizzes"
    quiz_file = quizzes_dir / f"{video_id}.json"
    
    if quiz_file.exists():
        try:
            generator = QuizGeneratorService()
            quiz = generator.load_quiz(video_id)
            validation = generator.validate_quiz(quiz)
            
            return {
                "status": "completed",
                "video_id": video_id,
                "total_questions": len(quiz.questions),
                "needs_review": validation["needs_review"],
                "valid": validation["valid"]
            }
        except Exception as e:
            return {
                "status": "error",
                "video_id": video_id,
                "error": str(e)
            }
    else:
        return {
            "status": "not_started",
            "video_id": video_id
        }


@router.post("/video/{video_id}/validate")
async def validate_quiz(video_id: str):
    """
    Validate quiz for common issues
    
    Returns validation report with:
    - valid: Boolean indicating if quiz passes validation
    - issues: List of critical problems
    - warnings: List of potential problems
    - total_questions: Number of questions
    - needs_review: Number of questions flagged for review
    """
    try:
        generator = QuizGeneratorService()
        quiz = generator.load_quiz(video_id)
        validation = generator.validate_quiz(quiz)
        
        return validation
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video/{video_id}/question/{question_id}/submit")
async def submit_answer(video_id: str, question_id: int, answer_index: int):
    """
    Submit an answer for a quiz question
    
    Args:
        video_id: ID of the video
        question_id: Index of the question (0-based)
        answer_index: Selected option index (0-3)
    
    Returns:
        - correct: Boolean
        - explanation: Explanation of correct answer
        - correct_index: The correct option index
    """
    try:
        generator = QuizGeneratorService()
        quiz = generator.load_quiz(video_id)
        
        if question_id < 0 or question_id >= len(quiz.questions):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid question_id: {question_id}"
            )
        
        if not (0 <= answer_index <= 3):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid answer_index: {answer_index} (must be 0-3)"
            )
        
        question = quiz.questions[question_id]
        is_correct = (answer_index == question.correct_index)
        
        return {
            "correct": is_correct,
            "selected_index": answer_index,
            "correct_index": question.correct_index,
            "explanation": question.explanation,
            "timestamp_reference": question.timestamp_reference
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/video/{video_id}/question/{question_id}/review")
async def mark_question_reviewed(
    video_id: str,
    question_id: int,
    review: QuizReviewRequest
):
    """
    Mark a question as reviewed by a human
    
    This endpoint allows instructors to review questions flagged by the AI
    and mark them as approved or note any issues.
    
    Args:
        video_id: ID of the video
        question_id: Index of the question (0-based)
        review: Review status and optional notes
    """
    try:
        generator = QuizGeneratorService()
        quiz = generator.load_quiz(video_id)
        
        if question_id < 0 or question_id >= len(quiz.questions):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid question_id: {question_id}"
            )
        
        # Update question
        question = quiz.questions[question_id]
        question.requires_review = not review.reviewed
        
        # Save updated quiz
        generator._save_quiz(quiz)
        
        return {
            "video_id": video_id,
            "question_id": question_id,
            "requires_review": question.requires_review,
            "reviewer_notes": review.reviewer_notes,
            "message": "Review status updated"
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
