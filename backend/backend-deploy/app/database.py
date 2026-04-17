from typing import AsyncGenerator, Generator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings

settings = get_settings()

Base = declarative_base()

# -------------------------
# SYNC DATABASE ENGINE
# -------------------------
try:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
    )
    # Test connection at startup
    with engine.connect():
        pass
except Exception:
    # Fallback to local SQLite for development
    engine = create_engine(
        "sqlite:///./cltourism.db",
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------
# ASYNC DATABASE ENGINE
# -------------------------
async_engine = None
AsyncSessionLocal = None

try:
    async_engine = create_async_engine(
        settings.database_url_async,
        pool_pre_ping=True,
    )
    AsyncSessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
except Exception:
    # Async DB is optional for now in development
    async_engine = None
    AsyncSessionLocal = None


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    if AsyncSessionLocal is None:
        raise RuntimeError("Async database is not configured.")
    async with AsyncSessionLocal() as session:
        yield session