from pydantic import BaseModel

class LocationOut(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    description: str | None = None

    class Config:
        from_attributes = True