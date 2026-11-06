import os
from pathlib import Path
from pydantic_settings import BaseSettings

PROJECT_ROOT = Path(__file__).resolve().parents[3]

class Settings(BaseSettings):
    APP_NAME: str = "PRISMORA AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    WORKSPACE_ROOT: Path = PROJECT_ROOT
    DATASET_DIR: Path = PROJECT_ROOT / "dataset"
    STORAGE_DIR: Path = PROJECT_ROOT / "storage"
    ORIGINALS_DIR: Path = PROJECT_ROOT / "storage" / "originals"
    RENDERED_DIR: Path = PROJECT_ROOT / "storage" / "rendered"
    EVIDENCE_DIR: Path = PROJECT_ROOT / "storage" / "evidence"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{(PROJECT_ROOT / 'prismora.db').as_posix()}"
    
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
