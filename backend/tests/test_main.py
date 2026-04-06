import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_async_db, Base
from app.config import get_settings


# Test database URL (using SQLite in-memory for fast, isolated tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def test_db_engine():
    """Create an in-memory SQLite engine for testing."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()


@pytest.fixture
async def test_db_session(test_db_engine):
    """Create a test database session."""
    async_session = async_sessionmaker(
        test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    
    async with async_session() as session:
        yield session


@pytest.fixture
def override_get_db(test_db_session):
    """Override the get_async_db dependency with test database."""
    async def _override_get_async_db():
        return test_db_session
    
    app.dependency_overrides[get_async_db] = _override_get_async_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
async def client(override_get_db):
    """Create an async test client."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_endpoint(client):
    """Test the /health endpoint returns 200 status."""
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_user_registration(client):
    """Test user registration at /api/auth/register endpoint."""
    register_data = {
        "email": "testuser@example.com",
        "password": "securepassword123",
        "full_name": "Test User",
    }
    
    response = await client.post("/api/auth/register", json=register_data)
    
    # Assert response status (adjust based on your actual endpoint behavior)
    assert response.status_code in [200, 201]
    
    # Verify response contains expected fields
    response_data = response.json()
    assert "email" in response_data or "message" in response_data


@pytest.mark.asyncio
async def test_duplicate_registration_fails(client):
    """Test that registering with the same email twice fails."""
    register_data = {
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "Duplicate User",
    }
    
    # First registration should succeed
    response1 = await client.post("/api/auth/register", json=register_data)
    assert response1.status_code in [200, 201]
    
    # Duplicate registration should fail
    response2 = await client.post("/api/auth/register", json=register_data)
    assert response2.status_code == 400
    assert "already registered" in response2.json().get("detail", "").lower()


@pytest.mark.asyncio
async def test_invalid_email_registration(client):
    """Test that registration with invalid email fails."""
    register_data = {
        "email": "not-an-email",
        "password": "password123",
        "full_name": "Invalid Email User",
    }
    
    response = await client.post("/api/auth/register", json=register_data)
    assert response.status_code == 422  # Validation error
