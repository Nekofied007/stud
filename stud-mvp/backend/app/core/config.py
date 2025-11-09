"""
Configuration management for STUD backend
Loads settings from environment variables
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # API Keys
    youtube_api_key: str = ""
    openai_api_key: str = ""
    
    # Database
    database_url: str = "postgresql://stud_user:stud_password@postgres:5432/stud"
    
    # Redis
    redis_url: str = "redis://redis:6379/0"
    
    # Vector DB
    vector_db_url: str = "http://weaviate:8080"
    
    # Application
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "change-this-in-production"
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://localhost:8000"
    
    # Rate Limiting
    rate_limit_free_tier: int = 10
    rate_limit_premium_tier: int = 100
    
    # Storage
    storage_type: str = "local"
    storage_path: str = "/app/data"
    
    # Transcription
    whisper_model: str = "base"
    max_video_duration_minutes: int = 120
    
    # Quiz Generation
    quiz_questions_per_video: int = 5
    quiz_difficulty_mix: str = "recall:2,apply:2,analyze:1"
    
    # AI Tutor
    tutor_model: str = "gpt-4"
    tutor_max_tokens: int = 500
    tutor_temperature: float = 0.7
    rag_top_k_chunks: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
