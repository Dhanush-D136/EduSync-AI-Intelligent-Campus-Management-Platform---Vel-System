import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Edison College AI Smart Attendance System"
    API_V1_STR: str = "/api/v1"
    
    # We will safely fallback to SQLite if PostgreSQL is not provided for local dev
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./attendance.db"
    )
    
    # Allow any CORS for development
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    # Attendance Configuration
    ATTENDANCE_WINDOW_MINUTES: int = 5
    REQUIRED_CONSECUTIVE_FRAMES: int = 10
    FACE_MATCH_THRESHOLD: float = 0.6
    
    class Config:
        case_sensitive = True

settings = Settings()
