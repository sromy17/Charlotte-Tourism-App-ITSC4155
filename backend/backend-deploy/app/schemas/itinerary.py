from pydantic import BaseModel
from typing import Any, Optional, List

# 1. Models for activity payloads
class ItineraryAttraction(BaseModel):
    id: str  # Frontend is sending String(item.id)
    name: str
    type: Optional[str] = "activity"
    api_source: Optional[str] = "manual"
    description: Optional[str] = ""
    location: Optional[str] = "Charlotte, NC"
    price: Optional[str] = "0"
    image_url: Optional[str] = None
    datetime: Optional[str] = None
    latitude: float = 35.2271
    longitude: float = -80.8431
    time: Optional[str] = "12:00"

    class Config:
        extra = "allow"
        from_attributes = True

class ItinerarySavedActivities(BaseModel):
    items: List[ItineraryAttraction]
    saved_at: Optional[str] = None

    class Config:
        extra = "allow"

class ItineraryBase(BaseModel):
    trip_name: str
    saved_activities: ItinerarySavedActivities

class ItineraryCreate(ItineraryBase):
    user_id: int  

class ItineraryResponse(ItineraryBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True