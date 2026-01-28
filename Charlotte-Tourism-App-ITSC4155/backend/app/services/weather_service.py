from typing import Any, Dict

import httpx


class WeatherService:
    """
    Service for fetching and analyzing current weather data from OpenWeather API.
    """

    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    def __init__(self, api_key: str) -> None:
        """
        Initialize WeatherService with API key.

        Args:
                api_key (str): OpenWeather API key
        """
        self.api_key = api_key

    async def get_current_weather(self, lat: float, lon: float) -> Dict[str, Any]:
        """
        Fetch current weather for given coordinates and analyze risk.

        Args:
                lat (float): Latitude
                lon (float): Longitude

        Returns:
                dict: Weather data and risk analysis
        """
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "imperial"}
        async with httpx.AsyncClient() as client:
            response = await client.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        humidity = data["main"]["humidity"]
        weather = data["weather"][0]
        description = weather["description"]
        icon = weather["icon"]
        weather_id = weather["id"]

        is_risky = self._check_weather_risk(weather_id)
        risk_reason = self._get_risk_reason(weather_id)

        return {
            "temperature": temp,
            "feels_like": feels_like,
            "humidity": humidity,
            "description": description,
            "icon": icon,
            "is_risky_for_outdoor": is_risky,
            "risk_reason": risk_reason,
        }

    def _check_weather_risk(self, weather_id: int) -> bool:
        """
        Determine if weather is risky for outdoor activities.

        Args:
                weather_id (int): OpenWeather weather condition code

        Returns:
                bool: True if risky, False otherwise
        """
        # We check weather_id ranges because OpenWeather uses codes:
        # 500-531: rain, 200-232: thunderstorm, 600-622: snow, 781: tornado, etc.
        if 200 <= weather_id <= 232:
            return True
        if 500 <= weather_id <= 531:
            return True
        if 600 <= weather_id <= 622:
            return True
        if weather_id == 781:
            return True
        return False

    def _get_risk_reason(self, weather_id: int) -> str:
        """
        Get reason for weather risk based on weather_id.

        Args:
                weather_id (int): OpenWeather weather condition code

        Returns:
                str: Reason for risk, or empty string if not risky
        """
        if 200 <= weather_id <= 232:
            return "Thunderstorm risk"
        if 500 <= weather_id <= 531:
            return "Rain risk"
        if 600 <= weather_id <= 622:
            return "Snow risk"
        if weather_id == 781:
            return "Tornado risk"
        return ""
