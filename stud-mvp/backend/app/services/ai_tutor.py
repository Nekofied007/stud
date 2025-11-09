"""
AI Tutor service using RAG (Retrieval-Augmented Generation)
Answers user questions based on video content with source citations
"""
import openai
from typing import List, Dict, Optional
from pathlib import Path
import json
import uuid
from datetime import datetime
from app.core.config import settings
from app.services.embeddings import EmbeddingService
from app.models.schemas import TutorResponse
import numpy as np


class AITutorService:
    """Service for conversational AI tutoring using RAG"""
    
    def __init__(self):
        self.api_key = settings.openai_api_key
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")
        openai.api_key = self.api_key
        self.model = "gpt-4"
        self.embedding_service = EmbeddingService()
        
    async def ask_question(
        self,
        question: str,
        video_id: Optional[str] = None,
        session_id: Optional[str] = None,
        top_k: int = 5,
        context_window: int = 3
    ) -> TutorResponse:
        """
        Answer a question using RAG
        
        Process:
        1. Embed the user's question
        2. Retrieve top-K similar chunks from video(s)
        3. Build context from retrieved chunks
        4. Include conversation history if session exists
        5. Generate answer with GPT-4
        6. Extract source citations and confidence
        7. Save to conversation history
        
        Args:
            question: User's question
            video_id: Optional - limit search to specific video
            session_id: Optional - conversation session ID
            top_k: Number of chunks to retrieve (default: 5)
            context_window: Number of previous messages to include (default: 3)
        
        Returns:
            TutorResponse with answer, sources, confidence, and suggested questions
        """
        print(f"🤖 AI Tutor processing question: {question[:50]}...")
        
        # Generate session ID if not provided
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Step 1: Retrieve relevant chunks
        relevant_chunks = await self._retrieve_relevant_chunks(
            question=question,
            video_id=video_id,
            top_k=top_k
        )
        
        if not relevant_chunks:
            return TutorResponse(
                question=question,
                answer="I couldn't find any relevant information in the video content to answer your question. Could you rephrase or ask about a different topic covered in the videos?",
                sources=[],
                confidence=0.0,
                suggested_questions=[],
                session_id=session_id
            )
        
        print(f"   Retrieved {len(relevant_chunks)} relevant chunks")
        
        # Step 2: Load conversation history
        conversation_history = self._load_conversation_history(session_id, context_window)
        
        # Step 3: Build prompt with context
        prompt = self._build_tutor_prompt(
            question=question,
            chunks=relevant_chunks,
            conversation_history=conversation_history
        )
        
        # Step 4: Generate answer with GPT-4
        try:
            response = await openai.chat.completions.acreate(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,  # Slightly higher for conversational tone
                max_tokens=800
            )
            
            answer_text = response.choices[0].message.content
            
            print(f"   Generated answer ({len(answer_text)} chars)")
            
        except Exception as e:
            print(f"❌ GPT-4 error: {e}")
            raise
        
        # Step 5: Extract source citations
        sources = self._extract_sources(relevant_chunks)
        
        # Step 6: Calculate confidence score
        confidence = self._calculate_confidence(relevant_chunks, answer_text)
        
        # Step 7: Generate suggested follow-up questions
        suggested_questions = self._generate_suggested_questions(
            question=question,
            answer=answer_text,
            chunks=relevant_chunks
        )
        
        # Step 8: Create response
        tutor_response = TutorResponse(
            question=question,
            answer=answer_text,
            sources=sources,
            confidence=confidence,
            suggested_questions=suggested_questions,
            session_id=session_id
        )
        
        # Step 9: Save to conversation history
        self._save_to_history(session_id, question, tutor_response)
        
        print(f"✅ Answer generated (confidence: {confidence:.2f})")
        return tutor_response
    
    async def _retrieve_relevant_chunks(
        self,
        question: str,
        video_id: Optional[str],
        top_k: int
    ) -> List[Dict]:
        """
        Retrieve most relevant chunks using semantic similarity
        """
        # Generate embedding for question
        query_embedding = await self.embedding_service.generate_embedding(question)
        
        # Load embedded chunks
        embeddings_dir = Path(settings.storage_path) / "embeddings"
        
        if not embeddings_dir.exists():
            return []
        
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
        
        if not all_chunks:
            return []
        
        # Compute cosine similarity
        similarities = []
        for chunk in all_chunks:
            chunk_embedding = chunk.get("embedding")
            if not chunk_embedding:
                continue
            
            # Cosine similarity
            similarity = np.dot(query_embedding, chunk_embedding) / (
                np.linalg.norm(query_embedding) * np.linalg.norm(chunk_embedding)
            )
            
            chunk_with_sim = chunk.copy()
            chunk_with_sim["similarity"] = float(similarity)
            similarities.append(chunk_with_sim)
        
        # Sort by similarity and return top K
        similarities.sort(key=lambda x: x["similarity"], reverse=True)
        return similarities[:top_k]
    
    def _get_system_prompt(self) -> str:
        """
        System prompt for AI Tutor with strict guidelines
        """
        return """You are an expert AI tutor helping students learn from video content.

CRITICAL GUIDELINES:
1. Answer questions ONLY based on the provided video transcript chunks
2. DO NOT introduce external knowledge or information not in the transcripts
3. If the transcripts don't contain enough information, say so clearly
4. Always cite specific parts of the transcript in your answer
5. Use timestamps when referring to specific content (e.g., "At 2:15, the video explains...")
6. Keep answers clear, concise, and educational
7. Use a friendly, encouraging teaching tone
8. If the question is unclear, ask for clarification
9. Break down complex topics into simpler explanations
10. Provide examples from the video when possible

FORMAT YOUR ANSWERS:
- Start with a direct answer
- Explain with references to the video content
- Use timestamps for specific references
- End with encouragement or related insight

Remember: You are teaching based on video content. Stay true to the source material."""
    
    def _build_tutor_prompt(
        self,
        question: str,
        chunks: List[Dict],
        conversation_history: List[Dict]
    ) -> str:
        """
        Build the prompt with context from retrieved chunks and history
        """
        # Add conversation history
        history_text = ""
        if conversation_history:
            history_text = "\n\nPREVIOUS CONVERSATION:\n"
            for entry in conversation_history:
                history_text += f"Student: {entry['question']}\n"
                history_text += f"Tutor: {entry['answer']}\n\n"
        
        # Add retrieved chunks as context
        context_text = "\n\nRELEVANT VIDEO CONTENT:\n"
        for i, chunk in enumerate(chunks, 1):
            timestamp = f"[{chunk['start']:.1f}s - {chunk['end']:.1f}s]"
            video_ref = f"(Video: {chunk['video_id']})"
            context_text += f"\nChunk {i} {timestamp} {video_ref}:\n{chunk['text']}\n"
        
        # Build full prompt
        prompt = f"""{history_text}
{context_text}

CURRENT QUESTION:
{question}

Please answer the student's question based on the video content above. Remember to:
- Reference specific parts of the transcript
- Use timestamps when appropriate
- Only use information from the provided content
- Be clear if information is insufficient"""
        
        return prompt
    
    def _extract_sources(self, chunks: List[Dict]) -> List[Dict]:
        """
        Extract source citations from chunks
        """
        sources = []
        for chunk in chunks:
            sources.append({
                "video_id": chunk["video_id"],
                "start": chunk["start"],
                "end": chunk["end"],
                "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"],
                "similarity": chunk.get("similarity", 0.0)
            })
        return sources
    
    def _calculate_confidence(self, chunks: List[Dict], answer: str) -> float:
        """
        Calculate confidence score based on:
        - Average similarity of retrieved chunks
        - Number of chunks retrieved
        - Presence of uncertainty phrases in answer
        """
        if not chunks:
            return 0.0
        
        # Average similarity
        avg_similarity = sum(c.get("similarity", 0) for c in chunks) / len(chunks)
        
        # Penalize if answer contains uncertainty phrases
        uncertainty_phrases = [
            "i don't know", "unclear", "not sure", "might be",
            "possibly", "i couldn't find", "insufficient"
        ]
        
        uncertainty_penalty = 0.0
        answer_lower = answer.lower()
        for phrase in uncertainty_phrases:
            if phrase in answer_lower:
                uncertainty_penalty = 0.2
                break
        
        # Penalize if very few chunks retrieved
        chunk_penalty = 0.0 if len(chunks) >= 3 else 0.1
        
        # Calculate final confidence
        confidence = avg_similarity - uncertainty_penalty - chunk_penalty
        confidence = max(0.0, min(1.0, confidence))  # Clamp to [0, 1]
        
        return round(confidence, 2)
    
    def _generate_suggested_questions(
        self,
        question: str,
        answer: str,
        chunks: List[Dict]
    ) -> List[str]:
        """
        Generate suggested follow-up questions
        Simple heuristic-based approach for MVP
        """
        suggestions = []
        
        # Extract topics from chunks
        chunk_texts = " ".join([c["text"] for c in chunks[:3]])
        
        # Common follow-up patterns
        if "what" in question.lower():
            suggestions.append("How does this work in practice?")
        if "how" in question.lower():
            suggestions.append("Can you give me an example?")
        if "why" in question.lower():
            suggestions.append("What are the benefits of this approach?")
        
        # Generic follow-ups
        suggestions.extend([
            "Can you explain this in simpler terms?",
            "What are common mistakes to avoid?",
            "Where can I learn more about this topic?"
        ])
        
        # Return up to 3 suggestions
        return suggestions[:3]
    
    def _load_conversation_history(
        self,
        session_id: str,
        context_window: int
    ) -> List[Dict]:
        """
        Load recent conversation history for context
        """
        history_dir = Path(settings.storage_path) / "conversations"
        history_file = history_dir / f"{session_id}.json"
        
        if not history_file.exists():
            return []
        
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                full_history = json.load(f)
            
            # Return last N entries
            return full_history[-context_window:] if context_window > 0 else []
        
        except Exception as e:
            print(f"⚠️  Error loading history: {e}")
            return []
    
    def _save_to_history(
        self,
        session_id: str,
        question: str,
        response: TutorResponse
    ):
        """
        Save Q&A to conversation history
        """
        history_dir = Path(settings.storage_path) / "conversations"
        history_dir.mkdir(parents=True, exist_ok=True)
        
        history_file = history_dir / f"{session_id}.json"
        
        # Load existing history
        if history_file.exists():
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = []
        
        # Add new entry
        entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "question": question,
            "answer": response.answer,
            "confidence": response.confidence,
            "num_sources": len(response.sources)
        }
        
        history.append(entry)
        
        # Save updated history
        with open(history_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2)
        
        print(f"💾 Saved to conversation history: {session_id}")
    
    def get_conversation_history(self, session_id: str) -> List[Dict]:
        """
        Get full conversation history for a session
        """
        return self._load_conversation_history(session_id, context_window=-1)
    
    def clear_conversation_history(self, session_id: str):
        """
        Clear conversation history for a session
        """
        history_dir = Path(settings.storage_path) / "conversations"
        history_file = history_dir / f"{session_id}.json"
        
        if history_file.exists():
            history_file.unlink()
            print(f"🗑️  Cleared history for session: {session_id}")


# CLI interface
if __name__ == "__main__":
    import asyncio
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python ai_tutor.py '<question>' [video_id] [session_id]")
        print("Example: python ai_tutor.py 'What are Python variables?' sample001")
        sys.exit(1)
    
    question = sys.argv[1]
    video_id = sys.argv[2] if len(sys.argv) > 2 else None
    session_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    async def main():
        tutor = AITutorService()
        response = await tutor.ask_question(
            question=question,
            video_id=video_id,
            session_id=session_id
        )
        
        print(f"\n💬 Question: {response.question}")
        print(f"\n🤖 Answer:\n{response.answer}")
        print(f"\n📊 Confidence: {response.confidence:.2%}")
        print(f"\n📚 Sources ({len(response.sources)}):")
        for i, source in enumerate(response.sources, 1):
            print(f"   {i}. Video {source['video_id']} [{source['start']:.1f}s-{source['end']:.1f}s]")
            print(f"      Similarity: {source['similarity']:.2%}")
        
        if response.suggested_questions:
            print(f"\n💡 Suggested questions:")
            for i, suggestion in enumerate(response.suggested_questions, 1):
                print(f"   {i}. {suggestion}")
        
        print(f"\n🆔 Session: {response.session_id}")
    
    asyncio.run(main())
