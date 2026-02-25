from fastapi import APIRouter, HTTPException
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

TICKETMASTER_KEY = os.getenv("TICKETMASTER_API_KEY", "")
TOMTOM_KEY = os.getenv("TOMTOM_API_KEY", "")

@router.post("/generate")
async def generate_itinerary(selections: dict):
    """
    Fetches live data from Ticketmaster and TomTom. 
    Includes fallbacks so the frontend never receives a blank list.
    """
    suggestions = []
    
    try:
        # 1. TICKETMASTER FETCH
        if TICKETMASTER_KEY and TICKETMASTER_KEY != "your-ticketmaster-api-key":
            tm_url = f"https://app.ticketmaster.com/discovery/v2/events.json?apikey={TICKETMASTER_KEY}&city=Charlotte&size=5"
            tm_res = requests.get(tm_url).json()
            
            if "_embedded" in tm_res:
                for event in tm_res["_embedded"]["events"]:
                    # Safely grab the venue name so it doesn't crash if a venue is missing
                    venues = event.get("_embedded", {}).get("venues", [{}])
                    venue_name = venues[0].get("name", "Charlotte Venue")
                    
                    suggestions.append({
                        "id": f"tm-{event['id']}",
                        "time": "Evening Event",
                        "activity": event.get("name", "Live Event"),
                        "location": venue_name,
                        "cost": "$$$",
                        "description": f"Live event at {venue_name}. Check Ticketmaster for tickets!",
                    })
            else:
                print("Ticketmaster didn't return events. Check API Key or rate limits.")

        # 2. TOMTOM FETCH
        if TOMTOM_KEY and TOMTOM_KEY != "your-tomtom-api-key":
            # Swapped 'categorySearch' for a more reliable generic 'search'
            tt_url = f"https://api.tomtom.com/search/2/search/Charlotte NC.json?key={TOMTOM_KEY}&limit=5"
            tt_res = requests.get(tt_url).json()
            
            if "results" in tt_res:
                for place in tt_res["results"]:
                    suggestions.append({
                        "id": f"tt-{place.get('id', '1')}",
                        "time": "Flexible Stop",
                        "activity": place.get("poi", {}).get("name", "Local Spot"),
                        "location": place.get("address", {}).get("freeformAddress", "Charlotte, NC"),
                        "cost": "$$",
                        "description": "A top-rated spot in Charlotte to explore.",
                    })
            else:
                 print("TomTom didn't return results. Check API Key.")

        # 3. BULLETPROOF FALLBACK
        # If both APIs failed (bad keys, no internet, etc), send this default data
        if len(suggestions) == 0:
            print("APIs returned nothing. Sending fallback data to frontend.")
            suggestions = [
                {
                    "id": "mock-1",
                    "time": "Morning",
                    "activity": "API Key Error: Using Fallback Data",
                    "location": "System Admin",
                    "cost": "$",
                    "description": "Your API keys in the backend .env failed. Here is placeholder data."
                },
                {
                    "id": "mock-2",
                    "time": "Afternoon",
                    "activity": "Mint Museum Uptown",
                    "location": "Uptown CLT",
                    "cost": "$$",
                    "description": "Explore modern art and design while you fix the API keys."
                }
            ]

        return suggestions

    except Exception as e:
        print(f"Backend Crash Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))