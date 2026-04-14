from typing import Any, Dict
import httpx
from datetime import datetime

class WeatherService:
    CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
    FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"

    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    async def get_forecast(self, lat: float, lon: float) -> Dict[str, Any]:
        if not self.api_key:
            raise Exception("Missing OpenWeather API key")

        params = {
            "lat": lat,
            "lon": lon,
            "appid": self.api_key,
            "units": "imperial"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(self.FORECAST_URL, params=params, timeout=10)

            # 🔥 This gives you the REAL error instead of just "Weather Error"
            if response.status_code != 200:
                raise Exception(f"OpenWeather failed: {response.text}")

            data = response.json()

        # 🔥 SAFETY CHECKS (this is what was crashing you before)
        if "list" not in data or len(data["list"]) == 0:
            raise Exception("Invalid weather response: missing forecast list")

        current = data["list"][0]

        hourly_data = []
        for entry in data["list"][:8]:
            try:
                dt = datetime.fromtimestamp(entry["dt"])

                hourly_data.append({
                    "time": dt.strftime("%I %p"),
                    "temp": round(entry["main"]["temp"]),
                    "icon": entry["weather"][0]["icon"],
                    "condition": entry["weather"][0]["main"]
                })
            except Exception as e:
                # skip broken entries instead of crashing everything
                continue

        return {
            "current_temp": round(current["main"]["temp"]),
            "description": current["weather"][0]["description"].title(),
            "humidity": current["main"]["humidity"],
            "hourly": hourly_data
        }