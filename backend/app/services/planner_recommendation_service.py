from __future__ import annotations

import asyncio
import os
from datetime import date, datetime, time, timezone
from typing import Dict, List, Optional, Tuple, Any

import httpx
import requests

from app.schemas.recommendations import PlannerRecommendationRequest, PlannerRecommendationResponse, RecommendationItem


CHARLOTTE_LAT = 35.2271
CHARLOTTE_LON = -80.8431
SEARCH_RADIUS_METERS = 16000

# ========== VIBE DICTIONARY ==========
VIBE_MAPPING = {
    "food_and_culture": {
        "tomtom_queries": ["museum", "art gallery", "historic district", "local restaurant", "food hall", "market"],
        "ticketmaster_keywords": ["museum", "culture", "market", "food festival", "art", "exhibit"],
        "outdoor_categories": ["park", "trail", "outdoor"],
        "indoor_categories": ["restaurant", "museum", "gallery", "bar", "cafe"],
    },
    "social_weekend": {
        "tomtom_queries": ["bar", "nightclub", "music venue", "brewery", "live music", "rooftop bar"],
        "ticketmaster_keywords": ["concert", "nightlife", "festival", "live music", "comedy", "sports"],
        "outdoor_categories": ["park", "street"],
        "indoor_categories": ["bar", "nightclub", "restaurant", "music venue", "comedy club"],
    },
    "leisure_and_luxury": {
        "tomtom_queries": ["spa", "luxury hotel", "fine dining", "steakhouse", "cocktail lounge", "golf"],
        "ticketmaster_keywords": ["gala", "premium", "vip", "wine", "orchestra", "ballet"],
        "outdoor_categories": ["golf", "resort"],
        "indoor_categories": ["spa", "hotel", "restaurant", "lounge", "theater"],
    },
    "city_explorer": {
        "tomtom_queries": ["landmark", "park", "neighborhood", "observation deck", "trail", "historic"],
        "ticketmaster_keywords": ["city tour", "outdoor", "family", "exhibit", "community", "historical"],
        "outdoor_categories": ["park", "trail", "landmark", "plaza"],
        "indoor_categories": ["museum", "gallery", "cafe", "visitor center"],
    },
}

CATEGORY_ALIASES: Dict[str, str] = {
    "food and culture": "food_and_culture",
    "food & culture": "food_and_culture",
    "food-and-culture": "food_and_culture",
    "social weekend": "social_weekend",
    "social-weekend": "social_weekend",
    "leisure and luxury": "leisure_and_luxury",
    "leisure & luxury": "leisure_and_luxury",
    "leisure-and-luxury": "leisure_and_luxury",
    "city explorer": "city_explorer",
    "city-explorer": "city_explorer",
}

CATEGORY_PRIORITIES: Dict[str, Dict[str, List[str]]] = {
    "food_and_culture": {
        "event_keywords": ["museum", "culture", "market", "food festival", "art"],
        "restaurant_queries": ["food hall", "local restaurant", "tasting menu", "southern food"],
        "activity_queries": ["museum", "market", "art gallery", "historic district"],
    },
    "social_weekend": {
        "event_keywords": ["concert", "nightlife", "festival", "live music", "comedy"],
        "restaurant_queries": ["bar", "trendy restaurant", "rooftop bar", "brewery"],
        "activity_queries": ["entertainment district", "music venue", "sports bar", "nightlife"],
    },
    "leisure_and_luxury": {
        "event_keywords": ["gala", "premium", "vip", "wine", "orchestra"],
        "restaurant_queries": ["fine dining", "steakhouse", "rooftop lounge", "luxury dining"],
        "activity_queries": ["spa", "luxury hotel", "cocktail lounge", "art museum"],
    },
    "city_explorer": {
        "event_keywords": ["city tour", "outdoor", "family", "exhibit", "community"],
        "restaurant_queries": ["charlotte restaurant", "local cafe", "popular brunch"],
        "activity_queries": ["park", "landmark", "neighborhood", "observation", "trail"],
    },
}

PRICE_SYMBOL_BY_TIER = {
    1: "$",
    2: "$$",
    3: "$$$",
    4: "$$$$",
}


# ========== WEATHER MODIFIER ==========
async def get_weather_forecast(start_date: str, end_date: str) -> Dict[str, Any]:
    """
    Fetch weather forecast from OpenWeatherMap for the given date range.
    
    Args:
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    
    Returns:
        Dictionary with weather data including rain probability
    """
    weather_api_key = os.getenv("OPENWEATHER_API_KEY")
    if not weather_api_key:
        return {"is_rainy": False, "conditions": "unknown"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                params={
                    "lat": CHARLOTTE_LAT,
                    "lon": CHARLOTTE_LON,
                    "appid": weather_api_key,
                    "units": "metric",
                }
            )
            response.raise_for_status()
            data = response.json()
            
            # Analyze weather for rain
            is_rainy = False
            max_rain_prob = 0
            conditions = []
            
            for forecast in data.get("list", [])[:8]:  # Check first 8 periods (~24 hours)
                weather = forecast.get("weather", [{}])[0]
                main_condition = weather.get("main", "").lower()
                conditions.append(main_condition)
                
                rain_prob = forecast.get("pop", 0)  # probability of precipitation
                max_rain_prob = max(max_rain_prob, rain_prob)
                
                if main_condition in ["rain", "thunderstorm", "drizzle"]:
                    is_rainy = True
            
            return {
                "is_rainy": is_rainy or max_rain_prob > 0.5,
                "rain_probability": max_rain_prob,
                "conditions": list(set(conditions))[:3]
            }
    except Exception as e:
        print(f"[Weather API Error] {e}")
        return {"is_rainy": False, "conditions": "unknown", "error": str(e)}


def apply_weather_modifier(queries: List[str], is_rainy: bool) -> List[str]:
    """
    Modify search queries based on weather conditions.
    
    If rainy:
    - Boost indoor categories (museums, restaurants, bars)
    - Reduce outdoor categories (parks, trails)
    
    Args:
        queries: Original search queries
        is_rainy: Whether rain is expected
        
    Returns:
        Modified list of queries optimized for weather
    """
    if not is_rainy:
        return queries
    
    # Boost indoor queries when rainy
    indoor_queries = [q for q in queries if any(
        indoor in q.lower() for indoor in ["museum", "restaurant", "bar", "cafe", "gallery", "spa", "hotel", "theater"]
    )]
    
    if indoor_queries:
        return indoor_queries + queries[:2]  # Indoor first, then some originals
    
    return queries


# ========== STANDARDIZED OUTPUT ==========
def standardize_recommendation(
    item_id: str,
    name: str,
    type_: str,
    api_source: str,
    description: str,
    location: Optional[str] = None,
    price: Optional[str] = None,
    image_url: Optional[str] = None,
    datetime_str: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a standardized recommendation item.
    
    Returns a consistent JSON structure for the frontend.
    """
    return {
        "id": item_id,
        "name": name,
        "type": type_,
        "api_source": api_source,
        "description": description,
        "location": location,
        "price": price,
        "image_url": image_url,
        "datetime": datetime_str,
    }


class PlannerRecommendationService:
    def __init__(self, ticketmaster_api_key: Optional[str], tomtom_api_key: Optional[str]) -> None:
        self.ticketmaster_api_key = ticketmaster_api_key
        self.tomtom_api_key = tomtom_api_key
        self.openweather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.eventbrite_api_key = os.getenv("EVENTBRITE_API_KEY")

    def generate(self, request: PlannerRecommendationRequest) -> PlannerRecommendationResponse:
        """Synchronous wrapper for backward compatibility."""
        category_key = self.normalize_category(request.category)
        priorities = CATEGORY_PRIORITIES.get(category_key, CATEGORY_PRIORITIES["city_explorer"])

        events = self._fetch_events(
            request_date=request.date,
            budget=request.budget,
            keywords=priorities["event_keywords"],
        )

        restaurants = self._fetch_places(
            queries=priorities["restaurant_queries"],
            request_date=request.date,
            budget=request.budget,
            result_type="restaurant",
            source_label="tomtom",
        )

        activities = self._fetch_places(
            queries=priorities["activity_queries"],
            request_date=request.date,
            budget=request.budget,
            result_type="activity",
            source_label="tomtom",
        )

        return PlannerRecommendationResponse(
            category=category_key,
            date=request.date,
            budget=request.budget,
            events=events,
            restaurants=restaurants,
            activities=activities,
        )

    async def generate_async(
        self,
        vibe: str,
        start_date: str,
        end_date: str,
        budget: int = 150
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Generate recommendations using concurrent API calls.
        
        Uses asyncio.gather() to fetch from TomTom, Ticketmaster, and Eventbrite
        simultaneously, with graceful failure handling.
        
        Args:
            vibe: One of "food_and_culture", "social_weekend", "leisure_and_luxury", "city_explorer"
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            budget: Budget limit per item
            
        Returns:
            Standardized nested dict with "restaurants", "activities", "events", "error" keys
        """
        vibe_key = self.normalize_category(vibe)
        vibe_config = VIBE_MAPPING.get(vibe_key, VIBE_MAPPING["city_explorer"])
        
        # Fetch weather and apply modifiers
        weather = await get_weather_forecast(start_date, end_date)
        is_rainy = weather.get("is_rainy", False)
        
        # Modify queries based on weather
        tomtom_queries = apply_weather_modifier(vibe_config["tomtom_queries"], is_rainy)
        ticketmaster_keywords = apply_weather_modifier(vibe_config["ticketmaster_keywords"], is_rainy)
        
        # Launch concurrent API calls
        tomtom_restaurants_task = self._fetch_tomtom_async(tomtom_queries, budget, "restaurant")
        tomtom_activities_task = self._fetch_tomtom_async(tomtom_queries, budget, "activity")
        ticketmaster_task = self._fetch_ticketmaster_async(ticketmaster_keywords, start_date, budget)
        eventbrite_task = self._fetch_eventbrite_async(start_date, budget)
        
        # Gather all results concurrently
        try:
            (
                restaurants,
                activities,
                events_tm,
                events_eb,
            ) = await asyncio.gather(
                tomtom_restaurants_task,
                tomtom_activities_task,
                ticketmaster_task,
                eventbrite_task,
                return_exceptions=True,
            )
            
            # Handle exceptions gracefully
            if isinstance(restaurants, Exception):
                print(f"[TomTom Restaurants Error] {restaurants}")
                restaurants = []
            if isinstance(activities, Exception):
                print(f"[TomTom Activities Error] {activities}")
                activities = []
            if isinstance(events_tm, Exception):
                print(f"[Ticketmaster Error] {events_tm}")
                events_tm = []
            if isinstance(events_eb, Exception):
                print(f"[Eventbrite Error] {events_eb}")
                events_eb = []
            
            # Combine events
            all_events = events_tm + events_eb
            
            return {
                "restaurants": restaurants,
                "activities": activities,
                "events": all_events,
                "vibe": vibe_key,
                "weather": weather,
            }
        except Exception as e:
            print(f"[Fatal Error in generate_async] {e}")
            return {
                "restaurants": [],
                "activities": [],
                "events": [],
                "vibe": vibe_key,
                "error": str(e),
                "weather": weather,
            }

    @staticmethod
    def normalize_category(category: str) -> str:
        cleaned = (category or "").strip().lower()
        return CATEGORY_ALIASES.get(cleaned, "city_explorer")

    # ========== SYNCHRONOUS METHODS (LEGACY) ==========

    def _fetch_events(self, request_date: date, budget: int, keywords: List[str]) -> List[RecommendationItem]:
        if not self.ticketmaster_api_key:
            return []

        start_dt = datetime.combine(request_date, time.min, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
        end_dt = datetime.combine(request_date, time.max, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

        params = {
            "apikey": self.ticketmaster_api_key,
            "city": "Charlotte",
            "size": 25,
            "sort": "date,asc",
            "startDateTime": start_dt,
            "endDateTime": end_dt,
            "keyword": " OR ".join(keywords),
        }

        try:
            response = requests.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params=params,
                timeout=8,
            )
            response.raise_for_status()
            payload = response.json()
        except Exception:
            return []

        raw_events = payload.get("_embedded", {}).get("events", [])
        recommendations: List[RecommendationItem] = []

        for event in raw_events:
            event_date = (
                event.get("dates", {})
                .get("start", {})
                .get("localDate")
            )
            if not event_date or event_date != request_date.isoformat():
                continue

            max_price, price_text = self._extract_ticketmaster_price(event)
            if max_price is not None and max_price > budget:
                continue

            venue = event.get("_embedded", {}).get("venues", [{}])[0]
            location = venue.get("name") or venue.get("city", {}).get("name") or "Charlotte"
            images = event.get("images", [])
            image = images[0].get("url") if images else None

            recommendations.append(
                RecommendationItem(
                    id=f"tm-{event.get('id', '')}",
                    name=event.get("name", "Charlotte Event"),
                    description=event.get("info")
                    or event.get("pleaseNote")
                    or "Live Charlotte event matched to your selected vibe.",
                    datetime=self._build_event_datetime(event),
                    location=location,
                    price=price_text,
                    image=image,
                    type="event",
                    source="ticketmaster",
                )
            )

        return recommendations[:12]

    def _fetch_places(
        self,
        queries: List[str],
        request_date: date,
        budget: int,
        result_type: str,
        source_label: str,
    ) -> List[RecommendationItem]:
        if not self.tomtom_api_key:
            return []

        results: List[RecommendationItem] = []
        seen_ids = set()

        for query in queries:
            params = {
                "key": self.tomtom_api_key,
                "lat": CHARLOTTE_LAT,
                "lon": CHARLOTTE_LON,
                "radius": SEARCH_RADIUS_METERS,
                "limit": 12,
            }

            try:
                response = requests.get(
                    f"https://api.tomtom.com/search/2/search/{query}%20charlotte.json",
                    params=params,
                    timeout=8,
                )
                response.raise_for_status()
                payload = response.json()
            except Exception:
                continue

            for entry in payload.get("results", []):
                place_id = str(entry.get("id", ""))
                if not place_id or place_id in seen_ids:
                    continue

                poi = entry.get("poi", {})
                categories = [c.lower() for c in poi.get("categories", [])]
                tier, tier_text = self._estimate_price_tier(query=query, categories=categories)
                estimated_max_price = self._tier_to_max_price(tier)
                if estimated_max_price > budget:
                    continue

                seen_ids.add(place_id)
                location = entry.get("address", {}).get("freeformAddress") or "Charlotte"
                recommendations_item = RecommendationItem(
                    id=f"tt-{place_id}",
                    name=poi.get("name") or query.title(),
                    description=self._build_place_description(query, categories, request_date),
                    datetime=request_date.isoformat(),
                    location=location,
                    price=tier_text,
                    image=None,
                    type=result_type,
                    source=source_label,
                )
                results.append(recommendations_item)

        return results[:15]

    @staticmethod
    def _build_event_datetime(event: Dict) -> Optional[str]:
        local_date = event.get("dates", {}).get("start", {}).get("localDate")
        local_time = event.get("dates", {}).get("start", {}).get("localTime")
        if not local_date:
            return None
        if local_time:
            return f"{local_date}T{local_time}"
        return local_date

    @staticmethod
    def _extract_ticketmaster_price(event: Dict) -> Tuple[Optional[float], Optional[str]]:
        ranges = event.get("priceRanges") or []
        if not ranges:
            return None, "Price unavailable"

        price_range = ranges[0]
        minimum = price_range.get("min")
        maximum = price_range.get("max")
        currency = price_range.get("currency", "USD")

        if minimum is None and maximum is None:
            return None, "Price unavailable"

        if minimum is not None and maximum is not None:
            return float(maximum), f"{currency} {minimum:.0f}-{maximum:.0f}"

        single = minimum if minimum is not None else maximum
        return float(single), f"{currency} {single:.0f}"

    @staticmethod
    def _estimate_price_tier(query: str, categories: List[str]) -> Tuple[int, str]:
        luxury_hints = {"rooftop", "fine", "luxury", "steakhouse", "vip", "spa"}
        budget_hints = {"park", "trail", "market", "museum", "cafe", "brewery"}

        score = 2
        q = query.lower()

        if any(hint in q for hint in luxury_hints):
            score = 4
        elif any(hint in q for hint in budget_hints):
            score = 1

        if any("hotel" in c or "nightlife" in c for c in categories):
            score = max(score, 3)
        if any("park" in c or "museum" in c for c in categories):
            score = min(score, 2)

        return score, PRICE_SYMBOL_BY_TIER[score]

    @staticmethod
    def _tier_to_max_price(tier: int) -> int:
        return {
            1: 45,
            2: 110,
            3: 220,
            4: 450,
        }.get(tier, 120)

    @staticmethod
    def _build_place_description(query: str, categories: List[str], request_date: date) -> str:
        category_text = ", ".join(categories[:2]) if categories else "charlotte"
        return (
            f"Recommended for your selected vibe: {query.title()} in Charlotte. "
            f"Relevant for {request_date.isoformat()} and tagged as {category_text}."
        )

    # ========== ASYNC METHODS (NEW) ==========

    async def _fetch_tomtom_async(
        self,
        queries: List[str],
        budget: int,
        result_type: str,
    ) -> List[Dict[str, Any]]:
        """
        Fetch places from TomTom API asynchronously.
        
        Args:
            queries: List of search queries (e.g., ["restaurant", "museum"])
            budget: Maximum price tier budget
            result_type: "restaurant" or "activity"
            
        Returns:
            List of standardized recommendation dictionaries
        """
        if not self.tomtom_api_key:
            return []

        results: List[Dict[str, Any]] = []
        seen_ids = set()

        async with httpx.AsyncClient(timeout=15.0) as client:
            tasks = []
            for query in queries:
                tasks.append(self._fetch_tomtom_query(client, query, budget, result_type, seen_ids))
            
            query_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for query_result in query_results:
                if not isinstance(query_result, Exception) and query_result:
                    results.extend(query_result)

        return results[:20]

    async def _fetch_tomtom_query(
        self,
        client: httpx.AsyncClient,
        query: str,
        budget: int,
        result_type: str,
        seen_ids: set,
    ) -> List[Dict[str, Any]]:
        """Fetch a single TomTom query."""
        results = []
        params = {
            "key": self.tomtom_api_key,
            "lat": CHARLOTTE_LAT,
            "lon": CHARLOTTE_LON,
            "radius": SEARCH_RADIUS_METERS,
            "limit": 12,
        }

        try:
            response = await client.get(
                f"https://api.tomtom.com/search/2/search/{query}%20charlotte.json",
                params=params,
            )
            response.raise_for_status()
            payload = response.json()
        except Exception as e:
            print(f"[TomTom Query Error] {query}: {e}")
            return results

        for entry in payload.get("results", []):
            place_id = str(entry.get("id", ""))
            if not place_id or place_id in seen_ids:
                continue

            poi = entry.get("poi", {})
            categories = [c.lower() for c in poi.get("categories", [])]
            
            tier, tier_text = self._estimate_price_tier(query=query, categories=categories)
            estimated_max_price = self._tier_to_max_price(tier)
            
            if estimated_max_price > budget:
                continue

            seen_ids.add(place_id)
            location = entry.get("address", {}).get("freeformAddress") or "Charlotte"
            
            recommendation = standardize_recommendation(
                item_id=f"tomtom-{place_id}",
                name=poi.get("name") or query.title(),
                type_=result_type,
                api_source="tomtom",
                description=f"{query.title()} in Charlotte. Categories: {', '.join(categories[:2])}",
                location=location,
                price=tier_text,
                image_url=None,
            )
            results.append(recommendation)

        return results

    async def _fetch_ticketmaster_async(
        self,
        keywords: List[str],
        start_date: str,
        budget: int,
    ) -> List[Dict[str, Any]]:
        """
        Fetch events from Ticketmaster API asynchronously.
        
        Args:
            keywords: Search keywords
            start_date: Date in YYYY-MM-DD format
            budget: Maximum budget
            
        Returns:
            List of standardized event recommendations
        """
        if not self.ticketmaster_api_key:
            return []

        results = []
        
        # Parse date
        try:
            parsed_date = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            print(f"[Ticketmaster] Invalid date format: {start_date}")
            return []

        start_dt = datetime.combine(parsed_date.date(), time.min, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
        end_dt = datetime.combine(parsed_date.date(), time.max, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

        params = {
            "apikey": self.ticketmaster_api_key,
            "city": "Charlotte",
            "size": 20,
            "sort": "date,asc",
            "startDateTime": start_dt,
            "endDateTime": end_dt,
            "keyword": " OR ".join(keywords),
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://app.ticketmaster.com/discovery/v2/events.json",
                    params=params,
                )
                response.raise_for_status()
                payload = response.json()
        except Exception as e:
            print(f"[Ticketmaster Error] {e}")
            return results

        raw_events = payload.get("_embedded", {}).get("events", [])

        for event in raw_events:
            event_date = event.get("dates", {}).get("start", {}).get("localDate")
            if not event_date or event_date != start_date:
                continue

            max_price, price_text = self._extract_ticketmaster_price(event)
            if max_price is not None and max_price > budget:
                continue

            venue = event.get("_embedded", {}).get("venues", [{}])[0]
            location = venue.get("name") or venue.get("city", {}).get("name") or "Charlotte"
            images = event.get("images", [])
            image_url = images[0].get("url") if images else None

            event_datetime = self._build_event_datetime(event)
            
            recommendation = standardize_recommendation(
                item_id=f"ticketmaster-{event.get('id', '')}",
                name=event.get("name", "Charlotte Event"),
                type_="event",
                api_source="ticketmaster",
                description=event.get("info") or event.get("pleaseNote") or "Live Charlotte event",
                location=location,
                price=price_text,
                image_url=image_url,
                datetime_str=event_datetime,
            )
            results.append(recommendation)

        return results[:12]

    async def _fetch_eventbrite_async(
        self,
        start_date: str,
        budget: int,
    ) -> List[Dict[str, Any]]:
        """
        Fetch events from Eventbrite API asynchronously.
        
        Args:
            start_date: Date in YYYY-MM-DD format
            budget: Maximum budget
            
        Returns:
            List of standardized event recommendations
        """
        if not self.eventbrite_api_key:
            return []

        results = []
        
        try:
            parsed_date = datetime.strptime(start_date, "%Y-%m-%d")
        except ValueError:
            print(f"[Eventbrite] Invalid date format: {start_date}")
            return []

        # Eventbrite expects ISO format
        start_iso = parsed_date.replace(hour=0, minute=0, second=0).isoformat() + "Z"
        end_iso = parsed_date.replace(hour=23, minute=59, second=59).isoformat() + "Z"

        params = {
            "location.address": "Charlotte, NC",
            "start_date.range_start": start_iso,
            "start_date.range_end": end_iso,
            "sort_by": "best",
            "expand": "venue",
        }

        headers = {
            "Authorization": f"Bearer {self.eventbrite_api_key}",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://www.eventbriteapi.com/v3/events/search/",
                    params=params,
                    headers=headers,
                )
                response.raise_for_status()
                payload = response.json()
        except Exception as e:
            print(f"[Eventbrite Error] {e}")
            return results

        events = payload.get("events", [])

        for event in events:
            name = event.get("name", {}).get("text", "Charlotte Event")
            description = event.get("description", {}).get("text", "Event in Charlotte")
            price = event.get("status", "")  # Eventbrite doesn't always return prices in search
            
            venue = event.get("venue", {})
            location = venue.get("name") or "Charlotte"
            
            image_url = event.get("logo", {}).get("url") if event.get("logo") else None
            
            event_datetime = event.get("start", {}).get("local", start_date)

            # Estimate price (usually free or paid, not always clear in API)
            price_text = "Price varies"
            
            recommendation = standardize_recommendation(
                item_id=f"eventbrite-{event.get('id', '')}",
                name=name,
                type_="event",
                api_source="eventbrite",
                description=description[:200],  # Truncate to 200 chars
                location=location,
                price=price_text,
                image_url=image_url,
                datetime_str=event_datetime,
            )
            results.append(recommendation)

        return results[:12]
