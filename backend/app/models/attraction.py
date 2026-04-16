from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    rating = Column(Float, nullable=True)