from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, List, Any
from datetime import date

from app.database import get_async_db
from app.models.itinerary import Itinerary
from app.schemas.itinerary import ItineraryCreate, ItineraryResponse
from app.services.planner_recommendation_service import PlannerRecommendationService
from app.config import get_settings

router = APIRouter()
settings = get_settings()
recommendation_service = PlannerRecommendationService(
    ticketmaster_api_key=settings.ticketmaster_api_key,
    tomtom_api_key=settings.tomtom_api_key,
)

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


@router.get("/recommendations/generate")
async def generate_recommendations(
    vibe: str = Query(..., description="Vibe: food_and_culture, social_weekend, leisure_and_luxury, or city_explorer"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    budget: int = Query(150, description="Budget per item in USD"),
) -> Dict[str, Any]:
    """
    Generate dynamic recommendations using multiple APIs concurrently.
    
    The endpoint:
    1. Fetches weather forecast to modify indoor/outdoor recommendations
    2. Queries TomTom for restaurants and activities
    3. Queries Ticketmaster for events
    4. Queries Eventbrite for additional events
    5. All API calls run in parallel using asyncio.gather()
    6. Returns standardized JSON with graceful fallbacks for failed APIs
    
    **Example request:**
    ```
    GET /api/itineraries/recommendations/generate?vibe=social_weekend&start_date=2026-05-15&budget=100
    ```
    
    **Response:**
    ```json
    {
        "restaurants": [
            {
                "id": "tomtom-12345",
                "name": "Rooftop Bar",
                "type": "restaurant",
                "api_source": "tomtom",
                "description": "Rooftop Bar in Charlotte...",
                "location": "123 Main St, Charlotte, NC",
                "price": "$$",
                "image_url": null
            }
        ],
        "activities": [...],
        "events": [...],
        "vibe": "social_weekend",
        "weather": {
            "is_rainy": false,
            "rain_probability": 0.2,
            "conditions": ["clear", "sunny"]
        }
    }
    ```
    """
    if end_date is None:
        end_date = start_date
    
    try:
        result = await recommendation_service.generate_async(
            vibe=vibe,
            start_date=start_date,
            end_date=end_date,
            budget=budget,
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )