from __future__ import annotations

from datetime import date, datetime, time, timezone
from typing import Dict, List, Optional, Tuple

import requests

from app.schemas.recommendations import PlannerRecommendationRequest, PlannerRecommendationResponse, RecommendationItem


CHARLOTTE_LAT = 35.2271
CHARLOTTE_LON = -80.8431
SEARCH_RADIUS_METERS = 16000

CATEGORY_ALIASES: Dict[str, str] = {
    "food and culture": "food-and-culture",
    "food & culture": "food-and-culture",
    "food-and-culture": "food-and-culture",
    "social weekend": "social-weekend",
    "social-weekend": "social-weekend",
    "leisure and luxury": "leisure-and-luxury",
    "leisure & luxury": "leisure-and-luxury",
    "leisure-and-luxury": "leisure-and-luxury",
    "city explorer": "city-explorer",
    "city-explorer": "city-explorer",
}

CATEGORY_PRIORITIES: Dict[str, Dict[str, List[str]]] = {
    "food-and-culture": {
        "event_keywords": ["museum", "culture", "market", "food festival", "art"],
        "restaurant_queries": ["food hall", "local restaurant", "tasting menu", "southern food"],
        "activity_queries": ["museum", "market", "art gallery", "historic district"],
    },
    "social-weekend": {
        "event_keywords": ["concert", "nightlife", "festival", "live music", "comedy"],
        "restaurant_queries": ["bar", "trendy restaurant", "rooftop bar", "brewery"],
        "activity_queries": ["entertainment district", "music venue", "sports bar", "nightlife"],
    },
    "leisure-and-luxury": {
        "event_keywords": ["gala", "premium", "vip", "wine", "orchestra"],
        "restaurant_queries": ["fine dining", "steakhouse", "rooftop lounge", "luxury dining"],
        "activity_queries": ["spa", "luxury hotel", "cocktail lounge", "art museum"],
    },
    "city-explorer": {
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


class PlannerRecommendationService:
    def __init__(self, ticketmaster_api_key: Optional[str], tomtom_api_key: Optional[str]) -> None:
        self.ticketmaster_api_key = ticketmaster_api_key
        self.tomtom_api_key = tomtom_api_key

    def generate(self, request: PlannerRecommendationRequest) -> PlannerRecommendationResponse:
        category_key = self.normalize_category(request.category)
        priorities = CATEGORY_PRIORITIES[category_key]

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

    @staticmethod
    def normalize_category(category: str) -> str:
        cleaned = (category or "").strip().lower()
        return CATEGORY_ALIASES.get(cleaned, "city-explorer")

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
