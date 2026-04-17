from sqlalchemy import Column, String, Float
from app.database import Base

class Attraction(Base):
    __tablename__ = "attractions"

    name = Column(String, primary_key=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    address = Column(String, nullable=True)