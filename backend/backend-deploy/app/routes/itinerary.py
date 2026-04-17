from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any, List
from datetime import date

from app.database import get_async_db
from app.models.itinerary import Itinerary
from app.models.location import Location
from app.schemas.itinerary import ItineraryCreate, ItineraryResponse
from app.services.planner_recommendation_service import PlannerRecommendationService
from app.config import get_settings

router = APIRouter()
settings = get_settings()
recommendation_service = PlannerRecommendationService(
    ticketmaster_api_key=settings.ticketmaster_api_key,
    tomtom_api_key=settings.tomtom_api_key,
)
# ✅ NEW CORRECT WAY
async def sync_locations_to_map(items: List[Any], db: AsyncSession):
    for item in items:
        # Since these are Pydantic objects, use dot notation or .dict().get()
        lat = getattr(item, 'latitude', None)
        lng = getattr(item, 'longitude', None)
        name = getattr(item, 'name', 'Unknown Spot')
        
        if lat is not None and lng is not None:
            try:
                # Standardize check
                stmt = select(Location).where(Location.name == name)
                result = await db.execute(stmt)
                if not result.scalar_one_or_none():
                    db.add(Location(
                        name=name,
                        latitude=float(lat),
                        longitude=float(lng),
                        category=getattr(item, 'type', 'activity')
                    ))
            except (ValueError, TypeError):
                continue

@router.post("/", response_model=ItineraryResponse)
async def create_itinerary(itinerary: ItineraryCreate, db: AsyncSession = Depends(get_async_db)):
    # Create the instance
    new_itinerary = Itinerary(
        trip_name=itinerary.trip_name,
        saved_activities=itinerary.saved_activities.dict(),
        user_id=itinerary.user_id,
    )
    db.add(new_itinerary)
    
    # Sync to the map
    await sync_locations_to_map(itinerary.saved_activities.items, db)
    
    # Commit and refresh
    await db.commit()
    await db.refresh(new_itinerary)
    
    return new_itinerary

@router.put("/{itinerary_id}", response_model=ItineraryResponse)
async def update_itinerary(itinerary_id: int, itinerary_data: ItineraryCreate, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Itinerary).where(Itinerary.id == itinerary_id))
    db_itinerary = result.scalar_one_or_none()
    
    if not db_itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    db_itinerary.saved_activities = itinerary_data.saved_activities.dict()
    # Sync new additions to the global map
    await sync_locations_to_map(itinerary_data.saved_activities.items, db)
    
    await db.commit()
    await db.refresh(db_itinerary)
    return db_itinerary

@router.get("/latest/{user_id}", response_model=Optional[ItineraryResponse])
async def get_latest_itinerary(user_id: int, db: AsyncSession = Depends(get_async_db)):
    """Fetch the absolute newest itinerary for the UI."""
    query = select(Itinerary).where(Itinerary.user_id == user_id).order_by(desc(Itinerary.id)).limit(1)
    result = await db.execute(query)
    return result.scalar_one_or_none()

@router.get("/all/{user_id}", response_model=List[ItineraryResponse])
async def get_itineraries_for_user(user_id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Itinerary).where(Itinerary.user_id == user_id).order_by(desc(Itinerary.id)))
    return result.scalars().all()

@router.delete("/{itinerary_id}")
async def delete_itinerary(itinerary_id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(Itinerary).where(Itinerary.id == itinerary_id))
    itinerary = result.scalar_one_or_none()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(itinerary)
    await db.commit()
    return {"message": "Deleted"}

@router.get("/recommendations/generate")
async def generate_recommendations(
    vibe: str = Query(...),
    start_date: str = Query(...),
    end_date: Optional[str] = Query(None),
    budget: int = Query(150),
):
    if not end_date: end_date = start_date
    try:
        return await recommendation_service.generate_async(vibe, start_date, end_date, budget)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    