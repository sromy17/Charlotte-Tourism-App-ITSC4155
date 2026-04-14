from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_async_db
from app.models.location import Location

router = APIRouter()

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
            "description": l.description
        }
        for l in locations
    ]