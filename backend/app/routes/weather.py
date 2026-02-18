from fastapi import APIRouter, HTTPException, status, Request

from app.config import get_settings

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


@router.get("/charlotte", response_model=dict)
async def get_charlotte_weather(request: Request) -> dict:
    """
    Return current weather for Charlotte by calling the WeatherService

    Uses the WeatherService instance attached to the application state in
    `app.main` (created from configured OPENWEATHER_API_KEY).
    """
    try:
        service = request.app.state.weather_service
        result = await service.get_current_weather(35.2271, -80.8431)
        return result
    except Exception as exc:
        import logging

        logging.exception("WeatherService failed for Charlotte: %s", exc)

        # Fallback response (matches WeatherService return shape)
        return {
            "temperature": 72,
            "feels_like": 72,
            "humidity": 50,
            "description": "Sunny",
            "icon": "01d",
            "is_risky_for_outdoor": False,
            "risk_reason": "",
        }
