from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.itinerary import router as itinerary_router

from app.config import get_settings
from app.routes.attractions import router as attractions_router
from app.routes.auth import router as auth_router
from app.routes.weather import router as weather_router

from app.database import engine, Base
import app.models  # This loads your User and Attraction blueprints

<<<<<<< HEAD
# Create tables if they don't exist
Base.metadata.create_all(bind=engine, checkfirst=True)
=======
# This command tells Postgres (or fallback DB) to create the tables if they don't exist yet!
try:
    Base.metadata.create_all(bind=engine)
except Exception:
    # In development we may not have a DB server running; fallback to SQLite automatically.
    pass
>>>>>>> 60d373a (Updated weather route to fetch live OpenWeather API data)

settings = get_settings()

app = FastAPI(title="CLTourism API", version="1.0.0")

# Permissive CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(weather_router, prefix="/api/weather", tags=["weather"])
app.include_router(attractions_router, prefix="/api/attractions", tags=["attractions"])
app.include_router(itinerary_router, prefix="/api/itineraries", tags=["itineraries"])

@app.get("/")
def root() -> dict:
    return {"message": "Welcome to CLTourism API"}

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}