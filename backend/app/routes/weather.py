from fastapi import APIRouter, HTTPException
from dotenv import load_dotenv
from app.config import get_settings
from app.services.weather_service import WeatherService

load_dotenv()

router = APIRouter()

@router.get("/")
async def get_weather_forecast(lat: float = 35.2271, lon: float = -80.8431):
    settings = get_settings()
    service = WeatherService(settings.openweather_api_key)
    try:
        # Calling the new forecast method we just wrote
        return await service.get_forecast(lat, lon)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Weather Error: {exc}")