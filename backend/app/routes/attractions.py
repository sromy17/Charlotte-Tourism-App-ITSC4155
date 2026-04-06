import random
import requests
import os
from fastapi import APIRouter, HTTPException, Depends
from urllib.parse import quote
from sqlalchemy.orm import Session

from app.database import get_db
from app.controllers import attractions_controller

router = APIRouter()

@router.get("/", tags=["attractions"])
def get_top_attractions():
    """Return a mock list of top Charlotte, NC tourist attractions."""
    return [
        {
            "id": 1,
            "name": "NASCAR Hall of Fame",
            "category": "Culture",
            "description": "Interactive exhibits celebrating motorsports history and legends.",
            "image_url": "https://via.placeholder.com/400x300?text=NASCAR+Hall+of+Fame"
        },
        {
            "id": 2,
            "name": "Freedom Park",
            "category": "Entertainment",
            "description": "Lush green space for relaxation, sports, and local festivals.",
            "image_url": "https://via.placeholder.com/400x300?text=Freedom+Park"
        },
        {
            "id": 3,
            "name": "Discovery Place Science",
            "category": "Culture",
            "description": "Hands-on science center with planetarium, live labs, and family exhibits.",
            "image_url": "https://via.placeholder.com/400x300?text=Discovery+Place+Science"
        },
        {
            "id": 4,
            "name": "U.S. National Whitewater Center",
            "category": "Entertainment",
            "description": "Outdoor adventure hub with rafting, zip lining, climbing, and trails.",
            "image_url": "https://via.placeholder.com/400x300?text=Whitewater+Center"
        }
    ]

# Config
TM_KEY = os.getenv("TICKETMASTER_API_KEY")
TT_KEY = os.getenv("TOMTOM_API_KEY")
OWM_KEY = os.getenv("OPENWEATHER_API_KEY")
START_COORDS = "35.2271,-80.8431"

# Curated "Must-See" Charlotte Spots
LOCAL_GEMS = [
    {"name": "Optimist Hall", "lat": 35.2346, "lon": -80.8261, "vibe": "indoor", "type": "Food Hall", "rating": 4.8},
    {"name": "US National Whitewater Center", "lat": 35.2726, "lon": -81.0053, "vibe": "outdoor", "type": "Adventure", "rating": 4.9},
    {"name": "Discovery Place Science", "lat": 35.2292, "lon": -80.8407, "vibe": "indoor", "type": "Museum", "rating": 4.7},
    {"name": "Camp North End", "lat": 35.2458, "lon": -80.8261, "vibe": "outdoor", "type": "Arts/Food", "rating": 4.6},
    {"name": "The Mint Museum", "lat": 35.2250, "lon": -80.8475, "vibe": "indoor", "type": "Art", "rating": 4.7},
    {"name": "Romare Bearden Park", "lat": 35.2285, "lon": -80.8465, "vibe": "outdoor", "type": "Park", "rating": 4.8}
]


def get_eta(lat, lon):
    try:
        url = f"https://api.tomtom.com/routing/1/calculateRoute/{START_COORDS}:{lat},{lon}/json?key={TT_KEY}&traffic=true"
        r = requests.get(url).json()
        return round(r['routes'][0]['summary']['travelTimeInSeconds'] / 60)
    except:
        return random.randint(10, 20)


@router.post("/generate")
async def generate_itinerary(user_data: dict):
    query = user_data.get("query", "").strip()
    target_date = user_data.get("date")
    persona = user_data.get("persona", "The Soloist")

    # Weather Awareness
    vibe = "outdoor"
    try:
        w_url = f"https://api.openweathermap.org/data/2.5/forecast?q=Charlotte&appid={OWM_KEY}&units=imperial"
        w_res = requests.get(w_url).json()

        for e in w_res.get("list", []):
            if target_date in e["dt_txt"]:
                if (
                    any(x in e["weather"][0]["main"].lower() for x in ["rain", "snow", "storm"])
                    or e["main"]["temp"] < 48
                ):
                    vibe = "indoor"
                break
    except:
        pass

    itinerary = []

    # Search Mode
    if query:
        search_url = f"https://api.tomtom.com/search/2/search/{quote(query)}.json?key={TT_KEY}&lat=35.2271&lon=-80.8431&radius=15000&limit=12"
        results = requests.get(search_url).json().get("results", [])

        for r in results:
            eta = get_eta(r["position"]["lat"], r["position"]["lon"])

            itinerary.append({
                "id": r["id"],
                "activity": r["poi"].get("name", query),
                "location": r["address"]["freeformAddress"],
                "drive_time": f"{eta} min",
                "cost": "$$" if "restaurant" in str(r).lower() else "$",
                "description": f"Custom result for your search: '{query}'."
            })

    else:
        # Ticketmaster Events
        tm_url = f"https://app.ticketmaster.com/discovery/v2/events.json?apikey={TM_KEY}&city=Charlotte&size=5"
        tm_res = requests.get(tm_url).json()

        if "_embedded" in tm_res:
            for ev in tm_res["_embedded"]["events"]:
                v = ev["_embedded"]["venues"][0]

                itinerary.append({
                    "id": f"tm-{ev['id']}",
                    "activity": ev["name"],
                    "location": v["name"],
                    "drive_time": f"{get_eta(v['location']['latitude'], v['location']['longitude'])} min",
                    "cost": "$$$",
                    "description": f"Featured Event! Perfect for {persona}."
                })

        # TomTom Category Search
        cat = "9376" if vibe == "indoor" else "8120"

        tt_url = f"https://api.tomtom.com/search/2/categorySearch/charlotte.json?key={TT_KEY}&categorySet={cat}&limit=6"
        tt_res = requests.get(tt_url).json().get("results", [])

        for r in tt_res:
            itinerary.append({
                "id": r["id"],
                "activity": r["poi"]["name"],
                "location": r["address"]["freeformAddress"],
                "drive_time": f"{get_eta(r['position']['lat'], r['position']['lon'])} min",
                "cost": "$",
                "description": f"Top-rated {vibe} spot in Charlotte."
            })

    # Fill Remaining With Local Gems
    while len(itinerary) < 12:
        gem = random.choice(LOCAL_GEMS)

        itinerary.append({
            "id": f"gem-{random.randint(1,1000)}",
            "activity": gem["name"],
            "location": gem["type"],
            "drive_time": f"{get_eta(gem['lat'], gem['lon'])} min",
            "cost": "$$",
            "description": f"Editor's Choice: ⭐ {gem['rating']}/5. Essential Charlotte experience."
        })

    random.shuffle(itinerary)

    return itinerary[:15]


# ==========================
# DATABASE ATTRACTION ROUTES
# ==========================

@router.get("/attractions")
async def list_attractions(db: Session = Depends(get_db)):
    return await attractions_controller.get_all_attractions(db)


@router.get("/attractions/{id}")
async def get_attraction(id: int, db: Session = Depends(get_db)):
    return await attractions_controller.get_attraction_by_id(db, id)


@router.post("/attractions")
async def create_attraction(attraction: dict, db: Session = Depends(get_db)):
    return await attractions_controller.create_attraction(db, attraction)