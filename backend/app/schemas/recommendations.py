from datetime import date as date_type
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PlannerRecommendationRequest(BaseModel):
    category: str = Field(..., description="Planner vibe/category key")
    date: date_type = Field(..., description="Requested visit date")
    budget: int = Field(..., ge=0, description="Maximum budget in USD")
    persona: Optional[str] = None
    protocol: Optional[str] = None
    start_date: Optional[date_type] = None
    end_date: Optional[date_type] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)


class RecommendationItem(BaseModel):
    id: str
    name: str
    description: str
    datetime: Optional[str] = None
    location: str
    latitude: float
    longitude: float
    price: Optional[str] = None
    image: Optional[str] = None
    type: str
    source: str


class PlannerRecommendationResponse(BaseModel):
    category: str
    date: date_type
    budget: int
    events: List[RecommendationItem] = Field(default_factory=list)
    restaurants: List[RecommendationItem] = Field(default_factory=list)
    activities: List[RecommendationItem] = Field(default_factory=list)
