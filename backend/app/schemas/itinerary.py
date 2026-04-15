from pydantic import BaseModel
from typing import Any, Optional
from datetime import datetime

# 1. The Base Schema (Shared properties)

class ItineraryBase(BaseModel):
    trip_name: str
    saved_activities: Any


# 2. Schema for CREATING an itinerary (What the frontend sends us)
class ItineraryCreate(ItineraryBase):
    user_id: int  # We need to know which user this trip belongs to

# 3. Schema for RETURNING an itinerary (What we send back to the frontend)
class ItineraryResponse(ItineraryBase):
    id: int
    user_id: int
    # created_at: datetime  <-- Uncomment this if you have a created_at column in your database model!

    class Config:
        # This is the magic line that tells Pydantic to read SQLAlchemy database models!
        from_attributes = True