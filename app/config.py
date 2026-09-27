import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-CIRCLE Digital Bridge to Formal E-Waste Recycling"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ecircle_db")
    DB_FALLBACK_URL: str = "sqlite:///./ecircle.db"
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "ecircle-super-secret-jwt-key-2026-production")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")) # 24 hours
    
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin@2026#Secure")
    
    MAPS_API_KEY: str = os.getenv("MAPS_API_KEY", "demo-maps-key")
    AI_MODEL_PATH: str = os.getenv("AI_MODEL_PATH", "models/yolo_ewaste.pt")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
