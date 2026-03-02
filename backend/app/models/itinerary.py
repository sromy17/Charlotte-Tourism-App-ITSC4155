from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.database import Base

class Itinerary(Base):
    """
    Stores saved weather-optimized itineraries for CLTourism users.
    
    Links to the User table and stores the raw JSON data of saved locations.
    """
    __tablename__ = "itineraries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    trip_name = Column(String, index=True, nullable=False)
    
    # JSON column allows us to store an array of Yelp/Ticketmaster objects easily
    saved_activities = Column(JSON, nullable=False) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())