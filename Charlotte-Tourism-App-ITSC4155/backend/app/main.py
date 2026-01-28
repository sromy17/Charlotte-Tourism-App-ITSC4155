from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes.attractions import router as attractions_router
from app.routes.auth import router as auth_router
from app.routes.weather import router as weather_router

settings = get_settings()

app = FastAPI(title="Niner-Navigate API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(attractions_router, prefix="/api/attractions", tags=["attractions"])


@app.get("/")
def root() -> dict:
    """
    Root endpoint for Niner-Navigate API.

    Returns:
            dict: Welcome message
    """
    return {"message": "Welcome to Niner-Navigate API"}


@app.get("/health")
def health_check() -> dict:
    """
    Health check endpoint for monitoring service status.

    Returns:
            dict: Health status
    """
    return {"status": "ok"}
