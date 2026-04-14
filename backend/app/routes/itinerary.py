from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_db
from app.models.itinerary import Itinerary  # Make sure this matches your model class name!
from app.schemas.itinerary import ItineraryCreate, ItineraryResponse

router = APIRouter()

@router.post("/", response_model=ItineraryResponse)
async def create_itinerary(itinerary: ItineraryCreate, db: AsyncSession = Depends(get_async_db)):
    """
    Save a new generated itinerary to the database.
    """
    # 1. Package the validated frontend data into a database model
    new_itinerary = Itinerary(
        trip_name=itinerary.trip_name,
        saved_activities=itinerary.saved_activities,
        user_id=itinerary.user_id
    )

    # 2. Add it to the database session and save it
    db.add(new_itinerary)
    await db.commit()
    
    # 3. Refresh to get the brand new ID assigned by PostgreSQL
    await db.refresh(new_itinerary)
    
    # 4. Return the saved trip back to the frontend
    return new_itinerary


@router.get("/{user_id}", response_model=list[ItineraryResponse])
async def get_itineraries_for_user(user_id: int, db: AsyncSession = Depends(get_async_db)):
    """Fetch all saved itineraries for the specified user_id."""
    result = await db.execute(select(Itinerary).where(Itinerary.user_id == user_id))
    itineraries = result.scalars().all()
    return itineraries


@router.delete("/{itinerary_id}")
async def delete_itinerary(itinerary_id: int, db: AsyncSession = Depends(get_async_db)):
    """Delete an itinerary by ID."""
    result = await db.execute(select(Itinerary).where(Itinerary.id == itinerary_id))
    itinerary = result.scalar_one_or_none()
    
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    db.delete(itinerary)
    await db.commit()
    return {"message": "Itinerary deleted successfully"}