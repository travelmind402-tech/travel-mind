from pydantic import BaseModel
from typing import Literal, List, Optional

class UserProfile(BaseModel):
    name: str
    destination: str
    country: str
    travel_start_date: str
    travel_end_date: str
    daily_budget_usd: float
    traveler_type: Literal["solo", "elderly", "student", "family"]
    family_members: Optional[int] = None
    languages_spoken: List[str]

class SessionStartResponse(BaseModel):
    session_id: str
    welcome_message: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    agents_used: List[str]

class WeatherRequest(BaseModel):
    city: str
    country: str
    travel_start_date: str
    travel_end_date: str
    # Added "family" to the list of allowed types
    traveler_type: Literal["solo", "elderly", "student", "family"] 
    family_members: int = 0  # <-- IT'S BACK!
    known_allergies: List[str] = []
    # TOPIC 2 ADDITION:
    transit_waypoints: List[str] = []

# ── NEW: Activity model ───────────────────────────────────
class Activity(BaseModel):
    name: str
    type: Literal[
        "outdoor",      # trekking, waterfalls, beaches
        "indoor",       # museums, malls, restaurants
        "flexible"      # can be done in any weather
    ]
    preferred_date: Optional[str] = None  # "YYYY-MM-DD"
    duration_hours: float = 2.0
    notes: Optional[str] = None           # e.g. "requires dry road"

# ── NEW: Itinerary reshuffler request ─────────────────────
class ItineraryRequest(BaseModel):
    city: str
    country: str
    travel_start_date: str
    travel_end_date: str
    traveler_type: Literal["solo", "elderly", "student", "family"]
    activities: List[Activity]
    daily_start_time: str = "09:00"
    daily_end_time: str = "21:00"
    avoid_extreme_heat: bool = False
    avoid_rain_completely: bool = False
    daily_budget_usd: float = 50.0      # ← added
    total_trip_budget_usd: Optional[float] = None  # ← added
    currency: str = "INR" 


class DisruptionRequest(BaseModel):
    city: str
    country: str
    travel_month: int           # 1-12
    travel_year: int
    traveler_type: Literal["solo", "elderly", "student", "family"]
    
class DrivingRequest(BaseModel):
    city: str
    country: str
    travel_start_date: str
    travel_end_date: str
    traveler_type: Literal["solo", "elderly", "student", "family"]
    route_waypoints: List[str] = []   # e.g. ["Guwahati", "Nongpoh", "Shillong"]
    vehicle_type: Literal[
        "car",
        "bike",
        "bus",
        "suv",
        "scooter"
    ] = "car"
    driver_experience: Literal[
        "beginner",
        "intermediate",
        "expert"
    ] = "intermediate"
    night_driving: bool = False
