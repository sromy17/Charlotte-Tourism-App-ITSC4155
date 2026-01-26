from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.config import get_settings

# SQLAlchemy engine for database connection
settings = get_settings()
engine = create_engine(settings.database_url, pool_pre_ping=True)

# SessionLocal factory for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Yields:
            Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        # Always close the session to avoid connection leaks
        db.close()
