from typing import Any, Dict

import httpx
import logging


class WeatherService:
    """
    Service for fetching and analyzing current weather data from OpenWeather API.
    """

    BASE_URL = "https://api.openweathermap.org/data/2.5/weather"

    def __init__(self, api_key: str) -> None:
        """
        Initialize WeatherService with API key.

        Args:
                api_key (str): 5d33bc6d8e323fd68c2144f670d24c9c
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
        # First attempt: OpenWeather (requires API key)
        params = {"lat": lat, "lon": lon, "appid": self.api_key, "units": "imperial"}
        async with httpx.AsyncClient() as client:
            try:
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
            except httpx.HTTPStatusError as exc:
                # Log and fall back to Open-Meteo (no API key needed)
                logging.warning("OpenWeather failed (%s). Falling back to Open-Meteo.", exc)
            except Exception as exc:  # network, timeout, etc.
                logging.exception("OpenWeather request failed, falling back to Open-Meteo: %s", exc)

            # Fallback: Open-Meteo (free, no API key). Returns current_weather.temp and weathercode.
            om_url = "https://api.open-meteo.com/v1/forecast"
            om_params = {
                "latitude": lat,
                "longitude": lon,
                "current_weather": True,
                "temperature_unit": "fahrenheit",
                "windspeed_unit": "mph",
            }
            resp = await client.get(om_url, params=om_params, timeout=10)
            resp.raise_for_status()
            om = resp.json()
            cw = om.get("current_weather", {})
            temp = cw.get("temperature")
            feels_like = temp
            humidity = None
            weather_code = cw.get("weathercode")
            description = self._open_meteo_description(weather_code)
            icon = "01d"
            weather_id = weather_code or 0

            is_risky = self._check_open_meteo_risk(weather_code)
            risk_reason = self._get_open_meteo_risk_reason(weather_code)

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

    def _open_meteo_description(self, code: int | None) -> str:
        if code is None:
            return "Unknown"
        # Map basic WMO weather codes to short descriptions
        if code == 0:
            return "Clear"
        if code in (1, 2, 3):
            return "Partly cloudy"
        if 45 <= code <= 48:
            return "Fog"
        if 51 <= code <= 67:
            return "Rain"
        if 71 <= code <= 77:
            return "Snow"
        if 80 <= code <= 82:
            return "Rain showers"
        if 95 <= code <= 99:
            return "Thunderstorm"
        return "Cloudy"

    def _check_open_meteo_risk(self, code: int | None) -> bool:
        if code is None:
            return False
        if 95 <= code <= 99:
            return True
        if 51 <= code <= 67 or 80 <= code <= 82:
            return True
        if 71 <= code <= 77:
            return True
        return False

    def _get_open_meteo_risk_reason(self, code: int | None) -> str:
        if code is None:
            return ""
        if 95 <= code <= 99:
            return "Thunderstorm risk"
        if 51 <= code <= 67 or 80 <= code <= 82:
            return "Rain risk"
        if 71 <= code <= 77:
            return "Snow risk"
        return ""
