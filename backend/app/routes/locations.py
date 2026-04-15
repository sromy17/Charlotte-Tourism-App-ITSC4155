from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_async_db
from app.models.location import Location

router = APIRouter()


class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    description: str | None = None


@router.get("/locations")
async def get_locations(db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Location))
    locations = result.scalars().all()

    return [
        {
            "id": l.id,
            "name": l.name,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "description": l.description,
        }
        for l in locations
    ]


@router.post("/locations")
async def create_location(location: LocationCreate, db: AsyncSession = Depends(get_async_db)):
    new_location = Location(
        name=location.name,
        latitude=location.latitude,
        longitude=location.longitude,
        description=location.description,
    )
    db.add(new_location)
    await db.commit()
    await db.refresh(new_location)

    return {
        "id": new_location.id,
        "name": new_location.name,
        "latitude": new_location.latitude,
        "longitude": new_location.longitude,
        "description": new_location.description,
    }