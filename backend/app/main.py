from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routes.attractions import router as attractions_router
from app.routes.auth import router as auth_router
from app.routes.weather import router as weather_router

settings = get_settings()

app = FastAPI(title="CLTourism API", version="1.0.0")

# FIXED: Permissive CORS for development to stop "Connection Refused"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(attractions_router, prefix="/api/attractions", tags=["attractions"])

@app.get("/")
def root() -> dict:
    return {"message": "Welcome to CLTourism API"}

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}