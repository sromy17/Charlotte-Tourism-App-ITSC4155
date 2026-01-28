from fastapi import APIRouter, HTTPException, status

from app.config import get_settings
from app.services.weather_service import WeatherService

router = APIRouter()


@router.get("/current", response_model=dict)
async def get_current_weather(lat: float = 35.2271, lon: float = -80.8431) -> dict:
    """
    Get current weather for given coordinates (default: Charlotte, NC).

    Args:
            lat (float): Latitude
            lon (float): Longitude

    Returns:
            dict: Weather data and risk analysis
    """
    settings = get_settings()
    service = WeatherService(settings.openweather_api_key)
    try:
        return await service.get_current_weather(lat, lon)
    except Exception as exc:
        # Catch all exceptions to provide a user-friendly error message
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Weather service error: {exc}",
        )
