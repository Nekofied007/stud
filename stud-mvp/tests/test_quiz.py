"""
Unit tests for quiz generation service
"""
import pytest
from app.services.quiz_generator import QuizGeneratorService
from app.models.schemas import QuizData, QuizQuestion


def test_quiz_generator_initialization():
    """Test that QuizGeneratorService initializes correctly"""
    try:
        service = QuizGeneratorService()
        assert service.model == "gpt-4"
    except ValueError as e:
        # Expected if no API key
        assert "OPENAI_API_KEY" in str(e)


def test_load_quiz():
    """Test loading existing quiz from storage"""
    generator = QuizGeneratorService()
    
    try:
        quiz = generator.load_quiz("sample001")
        
        assert quiz.video_id == "sample001"
        assert len(quiz.questions) > 0
        
        # Check first question structure
        q = quiz.questions[0]
        assert isinstance(q, QuizQuestion)
        assert len(q.question) > 0
        assert len(q.options) == 4
        assert 0 <= q.correct_index <= 3
        assert len(q.explanation) > 0
        assert q.difficulty in ["beginner", "intermediate", "advanced"]
        
    except ValueError:
        # Sample quiz might not exist in test environment
        pytest.skip("Sample quiz not available")


def test_validate_quiz_valid():
    """Test validation of a well-formed quiz"""
    generator = QuizGeneratorService()
    
    try:
        quiz = generator.load_quiz("sample001")
        validation = generator.validate_quiz(quiz)
        
        assert "valid" in validation
        assert "issues" in validation
        assert "warnings" in validation
        assert "total_questions" in validation
        assert "needs_review" in validation
        
        # Sample quiz should be valid
        assert validation["valid"] is True
        assert len(validation["issues"]) == 0
        
    except ValueError:
        pytest.skip("Sample quiz not available")


def test_validate_quiz_invalid_options():
    """Test validation catches invalid option count"""
    generator = QuizGeneratorService()
    
    # Create quiz with invalid option count
    quiz = QuizData(
        video_id="test_invalid",
        questions=[
            QuizQuestion(
                question="Test question?",
                options=["A", "B"],  # Only 2 options (should be 4)
                correct_index=0,
                explanation="Test",
                difficulty="beginner",
                requires_review=False
            )
        ]
    )
    
    validation = generator.validate_quiz(quiz)
    
    assert validation["valid"] is False
    assert len(validation["issues"]) > 0
    assert any("4 options" in issue.lower() for issue in validation["issues"])


def test_validate_quiz_invalid_correct_index():
    """Test validation catches invalid correct_index"""
    generator = QuizGeneratorService()
    
    # Create quiz with invalid correct_index
    quiz = QuizData(
        video_id="test_invalid",
        questions=[
            QuizQuestion(
                question="Test question?",
                options=["A", "B", "C", "D"],
                correct_index=5,  # Invalid (should be 0-3)
                explanation="Test",
                difficulty="beginner",
                requires_review=False
            )
        ]
    )
    
    validation = generator.validate_quiz(quiz)
    
    assert validation["valid"] is False
    assert len(validation["issues"]) > 0
    assert any("correct_index" in issue.lower() for issue in validation["issues"])


def test_validate_quiz_duplicate_questions():
    """Test validation catches duplicate questions"""
    generator = QuizGeneratorService()
    
    # Create quiz with duplicate questions
    duplicate_question = QuizQuestion(
        question="Same question",
        options=["A", "B", "C", "D"],
        correct_index=0,
        explanation="Test",
        difficulty="beginner",
        requires_review=False
    )
    
    quiz = QuizData(
        video_id="test_duplicates",
        questions=[duplicate_question, duplicate_question]
    )
    
    validation = generator.validate_quiz(quiz)
    
    assert validation["valid"] is False
    assert any("duplicate" in issue.lower() for issue in validation["issues"])


def test_validate_quiz_warns_on_review_needed():
    """Test validation warns about questions needing review"""
    generator = QuizGeneratorService()
    
    quiz = QuizData(
        video_id="test_review",
        questions=[
            QuizQuestion(
                question="Test question?",
                options=["A", "B", "C", "D"],
                correct_index=0,
                explanation="Test",
                difficulty="beginner",
                requires_review=True  # Flagged for review
            )
        ]
    )
    
    validation = generator.validate_quiz(quiz)
    
    assert validation["needs_review"] == 1
    assert len(validation["warnings"]) > 0
    assert any("review" in warning.lower() for warning in validation["warnings"])


def test_validate_quiz_warns_same_difficulty():
    """Test validation warns about same difficulty for all questions"""
    generator = QuizGeneratorService()
    
    # Create quiz with 4+ questions, all same difficulty
    questions = [
        QuizQuestion(
            question=f"Question {i}?",
            options=["A", "B", "C", "D"],
            correct_index=0,
            explanation="Test",
            difficulty="beginner",  # All beginner
            requires_review=False
        )
        for i in range(4)
    ]
    
    quiz = QuizData(video_id="test_difficulty", questions=questions)
    validation = generator.validate_quiz(quiz)
    
    assert len(validation["warnings"]) > 0
    assert any("same difficulty" in warning.lower() for warning in validation["warnings"])


def test_quiz_question_validation():
    """Test Pydantic validation of QuizQuestion"""
    # Valid question
    question = QuizQuestion(
        question="What is Python?",
        options=["A language", "A snake", "A framework", "A database"],
        correct_index=0,
        explanation="Python is a programming language",
        difficulty="beginner",
        requires_review=False
    )
    
    assert question.question == "What is Python?"
    assert len(question.options) == 4
    assert question.correct_index == 0
    
    # Invalid difficulty should raise error
    with pytest.raises(Exception):
        QuizQuestion(
            question="Test?",
            options=["A", "B", "C", "D"],
            correct_index=0,
            explanation="Test",
            difficulty="invalid_level",  # Invalid
            requires_review=False
        )


def test_build_quiz_prompt():
    """Test prompt building for GPT-4"""
    generator = QuizGeneratorService()
    
    chunks = [
        {
            "start": 0.0,
            "end": 10.0,
            "text": "This is a test transcript about Python variables."
        },
        {
            "start": 10.0,
            "end": 20.0,
            "text": "Variables are used to store data in memory."
        }
    ]
    
    prompt = generator._build_quiz_prompt(chunks, num_questions=3)
    
    # Check prompt contains key elements
    assert "3" in prompt or "three" in prompt.lower()
    assert "Python variables" in prompt
    assert "Variables are used to store data" in prompt
    assert "CRITICAL REQUIREMENTS" in prompt or "requirements" in prompt.lower()
    assert "JSON" in prompt.upper()
    assert "[0.0s - 10.0s]" in prompt or "0.0s" in prompt
    
    # Check anti-hallucination guidelines
    assert "ONLY" in prompt.upper() or "exclusively" in prompt.lower()
    assert "transcript" in prompt.lower()


def test_save_and_load_quiz():
    """Test round-trip save and load"""
    generator = QuizGeneratorService()
    
    # Create test quiz
    quiz = QuizData(
        video_id="test_save_load",
        questions=[
            QuizQuestion(
                question="Test question?",
                options=["A", "B", "C", "D"],
                correct_index=2,
                explanation="Test explanation",
                difficulty="intermediate",
                requires_review=False,
                timestamp_reference=15.5
            )
        ]
    )
    
    # Save
    generator._save_quiz(quiz)
    
    # Load
    loaded_quiz = generator.load_quiz("test_save_load")
    
    # Verify
    assert loaded_quiz.video_id == quiz.video_id
    assert len(loaded_quiz.questions) == len(quiz.questions)
    
    loaded_q = loaded_quiz.questions[0]
    original_q = quiz.questions[0]
    
    assert loaded_q.question == original_q.question
    assert loaded_q.options == original_q.options
    assert loaded_q.correct_index == original_q.correct_index
    assert loaded_q.explanation == original_q.explanation
    assert loaded_q.difficulty == original_q.difficulty
    assert loaded_q.timestamp_reference == original_q.timestamp_reference
