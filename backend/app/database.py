from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.config import get_settings

settings = get_settings()

try:
    engine = create_engine(settings.database_url, pool_pre_ping=True)
    # make sure DB is reachable at startup, otherwise fallback to local SQLite
    with engine.connect() as conn:
        pass
except Exception:
    engine = create_engine("sqlite:///./cltourism.db", connect_args={"check_same_thread": False})


# ----- SYNC ENGINE (for regular SQLAlchemy operations if needed) -----
engine = create_engine(settings.database_url, pool_pre_ping=True)
# ----- SYNC ENGINE (for regular SQLAlchemy operations if needed) -----
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ----- ASYNC ENGINE (for async routes) -----
async_engine = create_async_engine(settings.database_url_async, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ----- ASYNC ENGINE (for async routes) -----
async_engine = create_async_engine(settings.database_url_async, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()


# Dependency for sync DB
def get_db() -> Generator:
# Dependency for sync DB
    def get_db() -> Generator:
        db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency for async DB
async def get_async_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# Dependency for async DB
async def get_async_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session