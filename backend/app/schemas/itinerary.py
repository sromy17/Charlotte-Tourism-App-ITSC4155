from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

# 1. Models for activity payloads stored inside itinerary saved_activities
class ItineraryAttraction(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None

    class Config:
        extra = "allow"


class ItinerarySavedActivities(BaseModel):
    items: list[ItineraryAttraction]
    saved_at: Optional[str] = None

    class Config:
        extra = "allow"


# 2. The Base Schema (Shared properties)
class ItineraryBase(BaseModel):
    trip_name: str
    saved_activities: ItinerarySavedActivities


# 3. Schema for CREATING an itinerary (What the frontend sends us)
class ItineraryCreate(ItineraryBase):
    user_id: int  # We need to know which user this trip belongs to


# 4. Schema for RETURNING an itinerary (What we send back to the frontend)
class ItineraryResponse(ItineraryBase):
    id: int
    user_id: int
    # created_at: datetime  <-- Uncomment this if you have a created_at column in your database model!

    class Config:
        # This is the magic line that tells Pydantic read SQLAlchemy database models!
        from_attributes = True