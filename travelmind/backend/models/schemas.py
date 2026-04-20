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