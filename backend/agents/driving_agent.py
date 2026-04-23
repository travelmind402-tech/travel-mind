import asyncio
import json
import os
from datetime import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tools.weather_tool import (
    geocode_city,
    fetch_daily_forecast_for_reshuffler
)
from tools.driving_tool import (
    fetch_elevation,
    calculate_driving_score,
    analyse_route_conditions
)
from utils.cache import (
    build_cache_key,
    get_cache,
    set_cache,
    TTL
)

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY")
)

DRIVING_SYSTEM_PROMPT = """
You are an expert road safety and driving conditions analyst
for travelers in India and globally.

You receive:
1. Day-by-day weather forecast
2. Python-calculated driving scores per day
3. Terrain and elevation data
4. Route waypoint analysis
5. Vehicle type and driver experience

Produce a complete driving safety advisory.
Be specific about route names, road numbers, and local
knowledge about dangerous stretches.

Respond ONLY in this JSON format, no other text:
{
  "destination": "...",
  "overall_driving_risk": "low | moderate | high | extreme",
  "trip_driving_summary": "...",
  "daily_driving_guide": [
    {
      "date": "YYYY-MM-DD",
      "driving_score": 0,
      "condition": "excellent | good | moderate | poor | dangerous",
      "color_code": "green | yellow | orange | red",
      "recommendation": "...",
      "best_departure_time": "...",
      "max_speed_advisory": "...",
      "active_hazards": ["...", "..."],
      "route_specific_warnings": ["...", "..."],
      "emergency_stops": [
        {
          "location": "...",
          "reason": "...",
          "distance_from_start_km": 0
        }
      ]
    }
  ],
  "dangerous_stretches": [
    {
      "route_name": "...",
      "stretch": "...",
      "risk_type": "landslide | flood | fog | sharp_bends | poor_surface",
      "risk_level": "critical | high | medium",
      "advisory": "...",
      "alternative_route": "..."
    }
  ],
  "vehicle_specific_advice": {
    "vehicle_type": "...",
    "suitability_rating": "excellent | good | poor | unsuitable",
    "specific_tips": ["...", "..."],
    "modification_suggestions": ["...", "..."]
  },
  "driver_checklist": ["..."],
  "emergency_kit_for_conditions": ["..."],
  "emergency_contacts": [
    {
      "service": "...",
      "number": "...",
      "when_to_call": "..."
    }
  ],
  "fuel_advisory": "...",
  "parking_advisory": "...",
  "night_driving_assessment": "...",
  "best_driving_day": "YYYY-MM-DD",
  "worst_driving_day": "YYYY-MM-DD",
  "should_avoid_self_drive": false,
  "avoid_reason": null
}
"""


async def run_driving_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    route_waypoints: list,
    vehicle_type: str,
    driver_experience: str,
    night_driving: bool
) -> dict:

    # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "driving",
        city=city,
        start=travel_start_date,
        end=travel_end_date,
        vehicle=vehicle_type,
        experience=driver_experience,
        night=str(night_driving)
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[DrivingAgent] Serving from cache")
        return cached

    print(f"[DrivingAgent] Starting road condition "
          f"analysis for {city}...")

    # ── Geocode ───────────────────────────────────────
    coords = await geocode_city(city)
    if "error" in coords:
        return {
            "error": f"Could not locate {city}",
            "overall_driving_risk": "unknown"
        }

    lat = coords["latitude"]
    lon = coords["longitude"]

    # ── Fetch all data in parallel ────────────────────
    print(f"[DrivingAgent] Fetching data in parallel...")

    results = await asyncio.gather(
        fetch_daily_forecast_for_reshuffler(
            city,
            travel_start_date,
            travel_end_date
        ),
        fetch_elevation(lat, lon),
        analyse_route_conditions(
            route_waypoints,
            travel_start_date,
            travel_end_date,
            vehicle_type,
            driver_experience,
            night_driving
        ),
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(
            r, Exception) else {"error": str(r)}

    forecast       = safe(results[0])
    elevation_data = safe(results[1])
    route_analysis = results[2] if not isinstance(
        results[2], Exception) else []

    elevation_m  = elevation_data.get("elevation_m", 0)
    terrain_type = elevation_data.get(
        "terrain_type", "plains")

    print(f"[DrivingAgent] Elevation: {elevation_m}m "
          f"({terrain_type})")

    # ── Score each day in Python ──────────────────────
    daily_scores = []
    if isinstance(forecast, list):
        for day in forecast:
            if "error" in day:
                continue
            score = calculate_driving_score(
                day,
                elevation_m,
                terrain_type,
                vehicle_type,
                driver_experience,
                night_driving
            )
            daily_scores.append({
                "date":    day["date"],
                "weather": {
                    "rain_mm":  day.get("rain_mm", 0),
                    "wind_kmh": day.get("wind_kmh", 0),
                    "temp_max": day.get("temp_max_c", 0),
                    "temp_min": day.get("temp_min_c", 0),
                    "code":     day.get("weather_code", 0),
                    "sunrise":  day.get("sunrise", ""),
                    "sunset":   day.get("sunset", ""),
                },
                "driving_score": score
            })

    if not daily_scores:
        return {
            "error": "No forecast data for driving analysis",
            "overall_driving_risk": "unknown"
        }

    best_day  = max(
        daily_scores,
        key=lambda x: x["driving_score"]["driving_score"]
    )
    worst_day = min(
        daily_scores,
        key=lambda x: x["driving_score"]["driving_score"]
    )

    # ── Build bundle ──────────────────────────────────
    bundle = {
        "city":              city,
        "country":           country,
        "travel_dates":      (
            f"{travel_start_date} to {travel_end_date}"
        ),
        "traveler_type":     traveler_type,
        "vehicle_type":      vehicle_type,
        "driver_experience": driver_experience,
        "night_driving":     night_driving,
        "destination_elevation_m": elevation_m,
        "terrain_type":      terrain_type,
        "daily_driving_scores": daily_scores,
        "route_waypoints":   route_waypoints,
        "route_analysis":    route_analysis,
        "best_driving_day":  best_day["date"],
        "worst_driving_day": worst_day["date"],
        "trip_overview": {
            "total_days": len(daily_scores),
            "dangerous_days": sum(
                1 for d in daily_scores
                if d["driving_score"][
                    "driving_score"] < 20
            ),
            "poor_days": sum(
                1 for d in daily_scores
                if 20 <= d["driving_score"][
                    "driving_score"] < 40
            ),
            "good_days": sum(
                1 for d in daily_scores
                if d["driving_score"][
                    "driving_score"] >= 60
            ),
            "any_landslide_risk": any(
                d["driving_score"].get("landslide_risk")
                for d in daily_scores
            ),
            "any_frost_risk": any(
                d["driving_score"].get("frost_risk")
                for d in daily_scores
            ),
            "any_fog_risk": any(
                d["driving_score"].get("fog_risk")
                for d in daily_scores
            ),
        }
    }

    # ── Gemma analysis ────────────────────────────────
    print(f"[DrivingAgent] Sending to Gemma...")

    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Produce a complete driving safety "
                f"advisory for {city}, {country}:\n\n"
                f"{json.dumps(bundle, indent=2)}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=DRIVING_SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=2000,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)
        parsed["_raw_daily_scores"] = daily_scores
        parsed["_elevation_m"]      = elevation_m
        parsed["_terrain_type"]     = terrain_type
        parsed["_generated_at"]     = (
            datetime.now().isoformat()
        )

        # ── Cache result ──────────────────────────────
        await set_cache(
            cache_key, parsed, TTL["driving"]
        )
        return parsed

    except json.JSONDecodeError as e:
        print(f"[DrivingAgent] JSON parse error: {e}")
        return {
            "error":    "Gemma response parsing failed",
            "raw":      response.text[:500],
            "daily_scores_available": daily_scores,
            "overall_driving_risk": "unknown"
        }
    except Exception as e:
        print(f"[DrivingAgent] Error: {e}")
        return {
            "error": str(e),
            "overall_driving_risk": "unknown"
        }