from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base

# Route imports
from app.routes.itinerary import router as itinerary_router
from app.routes.attractions import router as attractions_router
from app.routes.auth import router as auth_router
from app.routes.weather import router as weather_router
from app.routes.locations import router as locations_router

import app.models  # Ensure models are registered


# -------------------------
# CREATE TABLES (SAFE)
# -------------------------
try:
    Base.metadata.create_all(bind=engine, checkfirst=True)
except Exception:
    # In development, DB might not be available — don't crash app
    pass


# -------------------------
# APP INIT
# -------------------------
settings = get_settings()

app = FastAPI(
    title="CLTourism API",
    version="1.0.0",
)


# -------------------------
# CORS (DEV FRIENDLY)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# ROUTES
# -------------------------
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(attractions_router, prefix="/api/attractions", tags=["attractions"])
app.include_router(itinerary_router, prefix="/api/itineraries", tags=["itineraries"])
app.include_router(locations_router, prefix="/api", tags=["locations"])


# -------------------------
# HEALTH + ROOT
# -------------------------
@app.get("/")
def root() -> dict:
    return {"message": "Welcome to CLTourism API"}


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}