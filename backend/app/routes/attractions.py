import logging
import os
import random
from urllib.parse import quote

import requests
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.controllers import attractions_controller
from app.database import get_db
from app.schemas.recommendations import (
    PlannerRecommendationRequest,
    PlannerRecommendationResponse,
)
from app.services.planner_recommendation_service import PlannerRecommendationService

logger = logging.getLogger(__name__)


class AttractionCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    description: str | None = None
    category: str | None = None
    rating: float | None = None

router = APIRouter()

TM_KEY = os.getenv("TICKETMASTER_API_KEY")
TT_KEY = os.getenv("TOMTOM_API_KEY")
OWM_KEY = os.getenv("OPENWEATHER_API_KEY")
START_COORDS = "35.2271,-80.8431"

REQUEST_TIMEOUT = 8


@router.get("/")
def get_top_attractions():
    """Return a mock list of top Charlotte, NC tourist attractions."""
    return [
        {
            "id": 1,
            "name": "NASCAR Hall of Fame",
            "category": "Culture",
            "description": "Interactive exhibits celebrating motorsports history and legends.",
            "image_url": "https://via.placeholder.com/400x300?text=NASCAR+Hall+of+Fame",
        },
        {
            "id": 2,
            "name": "Freedom Park",
            "category": "Entertainment",
            "description": "Lush green space for relaxation, sports, and local festivals.",
            "image_url": "https://via.placeholder.com/400x300?text=Freedom+Park",
        },
        {
            "id": 3,
            "name": "Discovery Place Science",
            "category": "Culture",
            "description": "Hands-on science center with planetarium, live labs, and family exhibits.",
            "image_url": "https://via.placeholder.com/400x300?text=Discovery+Place+Science",
        },
        {
            "id": 4,
            "name": "U.S. National Whitewater Center",
            "category": "Entertainment",
            "description": "Outdoor adventure hub with rafting, zip lining, climbing, and trails.",
            "image_url": "https://via.placeholder.com/400x300?text=Whitewater+Center",
        },
    ]


@router.post("/recommendations", response_model=PlannerRecommendationResponse)
async def get_planner_recommendations(payload: PlannerRecommendationRequest):
    """Generate planner recommendations filtered by category, date, and budget."""
    settings = get_settings()

    service = PlannerRecommendationService(
        ticketmaster_api_key=settings.ticketmaster_api_key,
        tomtom_api_key=settings.tomtom_api_key,
    )

    try:
        result = service.generate(payload)
        # If generate() is async, change the line above to:
        # result = await service.generate(payload)
        return result
    except Exception as exc:
        logger.exception("Failed to generate planner recommendations")
        raise HTTPException(
            status_code=502,
            detail="Failed to generate recommendations."
        ) from exc


LOCAL_GEMS = [
    {"name": "Optimist Hall", "lat": 35.2346, "lon": -80.8261, "vibe": "indoor", "type": "Food Hall", "rating": 4.8},
    {"name": "US National Whitewater Center", "lat": 35.2726, "lon": -81.0053, "vibe": "outdoor", "type": "Adventure", "rating": 4.9},
    {"name": "Discovery Place Science", "lat": 35.2292, "lon": -80.8407, "vibe": "indoor", "type": "Museum", "rating": 4.7},
    {"name": "Camp North End", "lat": 35.2458, "lon": -80.8261, "vibe": "outdoor", "type": "Arts/Food", "rating": 4.6},
    {"name": "The Mint Museum", "lat": 35.2250, "lon": -80.8475, "vibe": "indoor", "type": "Art", "rating": 4.7},
    {"name": "Romare Bearden Park", "lat": 35.2285, "lon": -80.8465, "vibe": "outdoor", "type": "Park", "rating": 4.8},
]


def get_eta(lat, lon):
    try:
        url = (
            f"https://api.tomtom.com/routing/1/calculateRoute/"
            f"{START_COORDS}:{lat},{lon}/json?key={TT_KEY}&traffic=true"
        )
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        data = response.json()
        return round(data["routes"][0]["summary"]["travelTimeInSeconds"] / 60)
    except Exception:
        logger.exception("Failed to fetch ETA from TomTom")
        return random.randint(10, 20)


@router.post("/generate")
async def generate_itinerary(user_data: dict):
    query = user_data.get("query", "").strip()
    target_date = user_data.get("date")
    persona = user_data.get("persona", "The Soloist")

    vibe = "outdoor"

    try:
        w_url = (
            "https://api.openweathermap.org/data/2.5/forecast"
            f"?q=Charlotte&appid={OWM_KEY}&units=imperial"
        )
        response = requests.get(w_url, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        w_res = response.json()

        for entry in w_res.get("list", []):
            if target_date and target_date in entry.get("dt_txt", ""):
                weather_main = entry["weather"][0]["main"].lower()
                temp = entry["main"]["temp"]

                if any(x in weather_main for x in ["rain", "snow", "storm"]) or temp < 48:
                    vibe = "indoor"
                break
    except Exception:
        logger.exception("Weather lookup failed during itinerary generation")

    itinerary = []

    if query:
        try:
            search_url = (
                f"https://api.tomtom.com/search/2/search/{quote(query)}.json"
                f"?key={TT_KEY}&lat=35.2271&lon=-80.8431&radius=15000&limit=12&fields=position"
            )
            response = requests.get(search_url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            results = response.json().get("results", [])

            for result in results:
                position = result.get("position") or {}
                latitude = float(position.get("lat", 0))
                longitude = float(position.get("lon", 0))
                eta = get_eta(latitude, longitude)
                itinerary.append(
                    {
                        "id": result["id"],
                        "activity": result["poi"].get("name", query),
                        "location": result["address"]["freeformAddress"],
                        "latitude": latitude,
                        "longitude": longitude,
                        "drive_time": f"{eta} min",
                        "cost": "$$" if "restaurant" in str(result).lower() else "$",
                        "description": f"Custom result for your search: '{query}'.",
                    }
                )
        except Exception as exc:
            logger.exception("TomTom search failed")
            raise HTTPException(
                status_code=502,
                detail="Failed to search attractions."
            ) from exc

    else:
        try:
            tm_url = (
                "https://app.ticketmaster.com/discovery/v2/events.json"
                f"?apikey={TM_KEY}&city=Charlotte&size=5"
            )
            response = requests.get(tm_url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            tm_res = response.json()

            if "_embedded" in tm_res:
                for event in tm_res["_embedded"]["events"]:
                    venue = event["_embedded"]["venues"][0]
                    venue_lat = float(venue["location"]["latitude"])
                    venue_lon = float(venue["location"]["longitude"])

                    itinerary.append(
                        {
                            "id": "tm-{0}".format(event["id"]),
                            "activity": event["name"],
                            "location": venue["name"],
                            "drive_time": "{0} min".format(get_eta(venue_lat, venue_lon)),
                            "cost": "$$$",
                            "description": f"Featured Event! Perfect for {persona}.",
                        }
                    )
        except Exception:
            logger.exception("Ticketmaster lookup failed")

        try:
            category = "9376" if vibe == "indoor" else "8120"
            tt_url = (
                "https://api.tomtom.com/search/2/categorySearch/charlotte.json"
                f"?key={TT_KEY}&categorySet={category}&limit=6&fields=position"
            )
            response = requests.get(tt_url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            tt_res = response.json().get("results", [])

            for result in tt_res:
                position = result.get("position") or {}
                latitude = float(position.get("lat", 0))
                longitude = float(position.get("lon", 0))
                itinerary.append(
                    {
                        "id": result["id"],
                        "activity": result["poi"]["name"],
                        "location": result["address"]["freeformAddress"],
                        "latitude": latitude,
                        "longitude": longitude,
                        "drive_time": "{0} min".format(
                            get_eta(latitude, longitude)
                        ),
                        "cost": "$",
                        "description": f"Top-rated {vibe} spot in Charlotte.",
                    }
                )
        except Exception:
            logger.exception("TomTom category search failed")

    while len(itinerary) < 12:
        gem = random.choice(LOCAL_GEMS)
        itinerary.append(
            {
                "id": f"gem-{random.randint(1, 1000)}",
                "activity": gem["name"],
                "location": gem["type"],
                "drive_time": f"{get_eta(gem['lat'], gem['lon'])} min",
                "cost": "$$",
                "description": f"Editor's Choice: ⭐ {gem['rating']}/5. Essential Charlotte experience.",
            }
        )

    random.shuffle(itinerary)
    return itinerary[:15]


@router.get("/db")
async def list_attractions(db: Session = Depends(get_db)):
    return await attractions_controller.get_all_attractions(db)


@router.get("/db/{id}")
async def get_attraction(id: int, db: Session = Depends(get_db)):
    return await attractions_controller.get_attraction_by_id(db, id)


@router.post("/")
async def create_attraction_root(attraction: AttractionCreate, db: Session = Depends(get_db)):
    return await attractions_controller.create_attraction(db, attraction.dict())


@router.post("/db")
async def create_attraction(attraction: dict, db: Session = Depends(get_db)):
    return await attractions_controller.create_attraction(db, attraction)