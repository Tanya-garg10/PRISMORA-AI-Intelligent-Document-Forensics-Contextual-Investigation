from pathlib import Path
from sqlalchemy import create_engine, make_url
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings
from backend.app.models.models import Base

database_url = make_url(settings.DATABASE_URL)
if database_url.get_backend_name() == "sqlite" and database_url.database not in (None, "", ":memory:"):
    db_file = Path(database_url.database)
    if not db_file.is_absolute():
        db_file = Path.cwd() / db_file
    db_file.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if database_url.get_backend_name() == "sqlite" else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    if database_url.get_backend_name() == "sqlite":
        with engine.begin() as conn:
            cols = {row[1] for row in conn.exec_driver_sql("PRAGMA table_info(forensic_observations)")}
            if cols and "ela_image_path" not in cols:
                conn.exec_driver_sql("ALTER TABLE forensic_observations ADD COLUMN ela_image_path VARCHAR(500)")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
