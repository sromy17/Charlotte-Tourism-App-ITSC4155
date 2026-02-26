from typing import Any, Dict
import httpx
from datetime import datetime

class WeatherService:
    # We need TWO different URLs from OpenWeather
    CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
    FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        """Fetches the 24-hour forecast (5 day/3 hour)"""
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "imperial"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(self.FORECAST_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

        # The first entry in the list
        current = data["list"][0]
        
        # Pull the next 8 entries (8 * 3 hours = 24 hours)
        hourly_data = []
        for entry in data["list"][:8]:
            dt = datetime.fromtimestamp(entry["dt"])
            hourly_data.append({
                "time": dt.strftime("%I %p"), 
                "temp": round(entry["main"]["temp"]),
                "icon": entry["weather"][0]["icon"],
                "condition": entry["weather"][0]["main"]
            })

        return {
            "current_temp": round(current["main"]["temp"]),
            "description": current["weather"][0]["description"].title(),
            "humidity": current["main"]["humidity"],
            "hourly": hourly_data  # THIS IS WHAT THE FRONTEND NEEDS
        }