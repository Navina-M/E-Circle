import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()

def get_engine_and_session():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("postgresql"):
            engine = create_engine(db_url, pool_pre_ping=True)
            # Test connection
            with engine.connect() as conn:
                pass
            logger.info("Connected successfully to PostgreSQL database.")
            return engine
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local database: {settings.DB_FALLBACK_URL}")
    
    # Fallback SQLite engine
    engine = create_engine(
        settings.DB_FALLBACK_URL, 
        connect_args={"check_same_thread": False} if "sqlite" in settings.DB_FALLBACK_URL else {}
    )
    return engine

engine = get_engine_and_session()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
