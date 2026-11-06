import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "PRISMORA AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    WORKSPACE_ROOT: Path = Path("/app/applet")
    DATASET_DIR: Path = Path("/app/applet/dataset")
    STORAGE_DIR: Path = Path("/app/applet/storage")
    ORIGINALS_DIR: Path = Path("/app/applet/storage/originals")
    RENDERED_DIR: Path = Path("/app/applet/storage/rendered")
    EVIDENCE_DIR: Path = Path("/app/applet/storage/evidence")
    
    # Database
    DATABASE_URL: str = "sqlite:////app/applet/prismora.db"
    
    # AI / Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # Forensic bounds
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".png", ".jpg", ".jpeg"}
    MAX_TOOL_CALL_BUDGET: int = 15

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
