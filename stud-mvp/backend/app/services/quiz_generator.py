"""
Quiz generation service using GPT-4
Generates multiple-choice questions from video transcripts
Follows strict anti-hallucination guidelines
"""
import openai
from typing import List, Dict
from pathlib import Path
import json
from app.core.config import settings
from app.models.schemas import QuizData, QuizQuestion


class QuizGeneratorService:
    """Service for generating quizzes from video content using GPT-4"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")
        openai.api_key = self.api_key
        self.model = "gpt-4"  # Use GPT-4 for better reasoning
        
    def _build_quiz_prompt(self, chunks: List[Dict], num_questions: int = 5) -> str:
        """
        Build the quiz generation prompt with anti-hallucination guidelines
        
        CRITICAL RULES (from user requirements):
        1. Generate questions ONLY from provided transcript content
        2. Do NOT introduce external knowledge or facts
        3. Each question must be directly verifiable from the transcript
        4. Incorrect options must be plausible but clearly wrong
        5. Flag questions for review if confidence is low
        """
        
        # Combine chunk texts
        transcript_text = "\n\n".join([
            f"[{chunk['start']:.1f}s - {chunk['end']:.1f}s]\n{chunk['text']}"
            for chunk in chunks
        ])
        
        prompt = f"""You are an expert educational quiz generator. Generate {num_questions} multiple-choice questions based ONLY on the following video transcript.

CRITICAL REQUIREMENTS:
1. Generate questions EXCLUSIVELY from the transcript content below
2. DO NOT add external facts, common knowledge, or assumptions
3. Each question must be directly answerable from the transcript
4. Provide 4 options (A, B, C, D) with exactly ONE correct answer
5. Incorrect options should be plausible but clearly wrong based on the transcript
6. Include a brief explanation citing the specific transcript segment
7. Assign a difficulty level: "beginner", "intermediate", or "advanced"
8. Set requires_review to true if you're uncertain about factual accuracy

TRANSCRIPT:
{transcript_text}

Generate {num_questions} questions in the following JSON format:
{{
  "questions": [
    {{
      "question": "What concept is explained in the video?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "The video states at 15s that...",
      "difficulty": "beginner",
      "requires_review": false,
      "timestamp_reference": 15.0
    }}
  ]
}}

IMPORTANT: Return ONLY valid JSON. No additional text or markdown formatting."""
        
        return prompt
    
    async def generate_quiz(
        self, 
        video_id: str, 
        num_questions: int = 5,
        difficulty: str = "mixed"
    ) -> QuizData:
        """
        Generate a quiz for a video using its embedded chunks
        
        Args:
            video_id: ID of the video
            num_questions: Number of questions to generate (default: 5)
            difficulty: Target difficulty ("beginner", "intermediate", "advanced", "mixed")
        
        Returns:
            QuizData object with generated questions
        """
        # Load embedded chunks
        embeddings_dir = Path(settings.storage_path) / "embeddings"
        embeddings_file = embeddings_dir / f"{video_id}.json"
        
        if not embeddings_file.exists():
            raise ValueError(f"Embeddings not found for video: {video_id}. Run embedding first.")
        
        with open(embeddings_file, 'r', encoding='utf-8') as f:
            chunks = json.load(f)
        
        print(f"🎯 Generating quiz for {video_id}")
        print(f"   Questions: {num_questions}")
        print(f"   Source chunks: {len(chunks)}")
        
        # Build prompt
        prompt = self._build_quiz_prompt(chunks, num_questions)
        
        # Call GPT-4
        try:
            response = await openai.chat.completions.acreate(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert educational content creator specializing in quiz generation from video transcripts. You follow strict guidelines to ensure factual accuracy."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,  # Lower temperature for consistency
                max_tokens=2000,
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            # Parse response
            result = json.loads(response.choices[0].message.content)
            questions_data = result.get("questions", [])
            
            print(f"   Generated: {len(questions_data)} questions")
            
            # Validate and create QuizQuestion objects
            questions = []
            for i, q_data in enumerate(questions_data):
                try:
                    question = QuizQuestion(
                        question=q_data["question"],
                        options=q_data["options"],
                        correct_index=q_data["correct_index"],
                        explanation=q_data["explanation"],
                        difficulty=q_data.get("difficulty", "intermediate"),
                        requires_review=q_data.get("requires_review", False),
                        timestamp_reference=q_data.get("timestamp_reference")
                    )
                    questions.append(question)
                except Exception as e:
                    print(f"   ⚠️  Warning: Skipping invalid question {i+1}: {e}")
                    continue
            
            if not questions:
                raise ValueError("No valid questions generated")
            
            # Create QuizData
            quiz = QuizData(
                video_id=video_id,
                questions=questions
            )
            
            # Save quiz
            self._save_quiz(quiz)
            
            # Report review status
            needs_review = sum(1 for q in questions if q.requires_review)
            if needs_review > 0:
                print(f"   ⚠️  {needs_review} questions flagged for human review")
            
            print(f"✅ Quiz generation complete")
            return quiz
            
        except Exception as e:
            print(f"❌ Quiz generation failed: {e}")
            raise
    
    def _save_quiz(self, quiz: QuizData):
        """Save quiz to JSON file"""
        output_dir = Path(settings.storage_path) / "quizzes"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_file = output_dir / f"{quiz.video_id}.json"
        
        # Convert to dict for JSON serialization
        quiz_dict = {
            "video_id": quiz.video_id,
            "questions": [
                {
                    "question": q.question,
                    "options": q.options,
                    "correct_index": q.correct_index,
                    "explanation": q.explanation,
                    "difficulty": q.difficulty,
                    "requires_review": q.requires_review,
                    "timestamp_reference": q.timestamp_reference
                }
                for q in quiz.questions
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(quiz_dict, f, indent=2)
        
        print(f"💾 Saved quiz to: {output_file}")
    
    def load_quiz(self, video_id: str) -> QuizData:
        """Load existing quiz from storage"""
        quizzes_dir = Path(settings.storage_path) / "quizzes"
        quiz_file = quizzes_dir / f"{video_id}.json"
        
        if not quiz_file.exists():
            raise ValueError(f"Quiz not found for video: {video_id}")
        
        with open(quiz_file, 'r', encoding='utf-8') as f:
            quiz_dict = json.load(f)
        
        # Convert back to QuizData
        questions = [
            QuizQuestion(**q_data)
            for q_data in quiz_dict["questions"]
        ]
        
        return QuizData(
            video_id=quiz_dict["video_id"],
            questions=questions
        )
    
    def validate_quiz(self, quiz: QuizData) -> Dict[str, any]:
        """
        Validate quiz for common issues
        
        Checks:
        - All questions have 4 options
        - Correct index is valid (0-3)
        - No duplicate questions
        - Reasonable difficulty distribution
        """
        issues = []
        warnings = []
        
        for i, q in enumerate(quiz.questions):
            # Check option count
            if len(q.options) != 4:
                issues.append(f"Question {i+1}: Expected 4 options, got {len(q.options)}")
            
            # Check correct_index
            if not (0 <= q.correct_index <= 3):
                issues.append(f"Question {i+1}: Invalid correct_index {q.correct_index} (must be 0-3)")
            
            # Check for very short questions
            if len(q.question) < 10:
                warnings.append(f"Question {i+1}: Question text seems too short")
            
            # Check for requires_review flag
            if q.requires_review:
                warnings.append(f"Question {i+1}: Flagged for human review")
        
        # Check for duplicate questions
        question_texts = [q.question.lower().strip() for q in quiz.questions]
        if len(question_texts) != len(set(question_texts)):
            issues.append("Duplicate questions detected")
        
        # Check difficulty distribution
        difficulties = [q.difficulty for q in quiz.questions]
        if len(set(difficulties)) == 1 and len(quiz.questions) > 3:
            warnings.append(f"All questions have same difficulty: {difficulties[0]}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "total_questions": len(quiz.questions),
            "needs_review": sum(1 for q in quiz.questions if q.requires_review)
        }


# CLI interface
if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python quiz_generator.py <video_id> [num_questions]")
        print("Example: python quiz_generator.py sample001 5")
        sys.exit(1)
    
    video_id = sys.argv[1]
    num_questions = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    
    async def main():
        generator = QuizGeneratorService()
        quiz = await generator.generate_quiz(video_id, num_questions)
        
        print(f"\n📊 Quiz Summary:")
        print(f"   Total questions: {len(quiz.questions)}")
        
        # Validate
        validation = generator.validate_quiz(quiz)
        print(f"   Valid: {validation['valid']}")
        print(f"   Needs review: {validation['needs_review']}")
        
        if validation['warnings']:
            print(f"\n⚠️  Warnings:")
            for warning in validation['warnings']:
                print(f"   - {warning}")
        
        # Show first question
        if quiz.questions:
            print(f"\n📝 Sample Question:")
            q = quiz.questions[0]
            print(f"   Q: {q.question}")
            for i, opt in enumerate(q.options):
                marker = "✓" if i == q.correct_index else " "
                print(f"   {marker} {chr(65+i)}. {opt}")
            print(f"   Difficulty: {q.difficulty}")
            print(f"   Explanation: {q.explanation}")
    
    asyncio.run(main())
