from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Loads application configuration from environment variables or .env file.
    """

    # Development-friendly defaults so the app can run without a .env file.
    database_url: str = "sqlite:///./dev.db"
    secret_key: str = "devsecretkey"
    algorithm: str = "HS256"
    access_token_expires_minutes: int = 30
    openweather_api_key: str = ""
    yelp_api_key: str = ""
    ticketmaster_api_key: str = ""
    tomtom_api_key: str = ""
    frontend_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached Settings instance for configuration access.
    """
    return Settings()
