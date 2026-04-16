from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from datetime import date

from app.database import get_async_db
from app.models.attraction import Attraction
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
    Save a new generated itinerary to the database, upserting attractions lazily.
    """
    saved_items = []

    async with db.begin():
        for attraction_payload in itinerary.saved_activities.items:
            attraction_name = attraction_payload.name.strip()
            result = await db.execute(
                select(Attraction).where(func.lower(Attraction.name) == attraction_name.lower())
            )
            attraction = result.scalars().first()

            if attraction is None:
                attraction = Attraction(
                    name=attraction_name,
                    latitude=attraction_payload.latitude,
                    longitude=attraction_payload.longitude,
                    address=attraction_payload.address,
                    category=attraction_payload.category,
                    rating=attraction_payload.rating,
                    description=attraction_payload.description,
                )
                db.add(attraction)
                await db.flush()

            activity_record = attraction_payload.dict(exclude_none=True)
            activity_record["attraction_id"] = attraction.id
            saved_items.append(activity_record)

        new_itinerary = Itinerary(
            trip_name=itinerary.trip_name,
            saved_activities={
                "items": saved_items,
                "saved_at": itinerary.saved_activities.saved_at,
            },
            user_id=itinerary.user_id,
        )
        db.add(new_itinerary)

    await db.refresh(new_itinerary)
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