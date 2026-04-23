import asyncio
import json
import os
from datetime import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tools.weather_tool import (
    geocode_city,
    call_openweathermap,
    fetch_historical_precipitation,
    fetch_reliefweb_disasters,
    fetch_ncei_station_data,
    fetch_health_and_pollen_data,
    fetch_route_forecast,
    calculate_mosquito_risk,
    fetch_historical_seismic_data,
    fetch_realtime_fires
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

WEATHER_SYSTEM_PROMPT = """You are a Master Disaster Prediction & Travel Weather Safety Analyst. 
Your goal is to cross-analyze 20 years of historical data with real-time variables to predict calamities and provide a high-fidelity travel safety advisory.

Respond ONLY in this JSON format:
{
  "summary": "...",
  "current_season": "e.g. Pre-Monsoon Spring in Northern India | Sakura Season in Japan",
  "temperature": "...",
  "conditions": "...",
  "severe_alerts": "...",
  "calamity_prediction_alert": {
    "status": "CLEAR | ADVISORY | CRITICAL",
    "predicted_events": ["Soil Liquefaction", "Rockfalls", "Broken Gas Lines", "Aftershocks", "Dam/Levee Failure"],
    "historical_basis": "Summary of 20-year seismic and flood patterns found",
    "probability_score": "0-100%"
  },
  "journey_weather_timeline": [],
  "travel_health_index": {
    "heat_stress_risk": "...",
    "mosquito_activity": "...",
    "air_quality_concern": "...",
    "uv_exposure_risk": "...",
    "overall_health_recommendation": "..."
  },
  "pollen_allergen_alerts": [
    {
      "allergen_type": "...",
      "level": "...",
      "origin_season": "...",
      "precautions": "..."
    }
  ],
  "seasonal_environmental_factors": {
    "sensory_note": "How the season affects the smell/feel of the air",
    "economic_impact": "Expected surge pricing or seasonal discounts",
    "infrastructure_risk": "Power outage risks or road slippery conditions"
  },
  "packing_tips": [],
  "best_time_outdoors": "...",
  "hazard_risk_assessment": {
    "overall_risk_level": "...",
    "primary_hazards": [
      {
        "hazard_type": "...",
        "risk_level": "...",
        "impact": "..."
      }
    ]
  },
  "traveler_safety_recommendations": [],
  "emergency_contacts_relevant": [],
  "should_reconsider_travel": false,
  "reconsider_reason": null
}

Rules you must follow:
1. DISASTER PREDICTION: Analyze 20-year seismic history. If max_magnitude > 6.0 AND soil moisture > 80%, predict HIGH risk of Soil Liquefaction. If Urban + Mag 6.5+ history, warn of Broken Gas Lines.
2. SEASONAL DETECTION: Identify the exact local season based on travel dates. Mention seasonal scents and economic impacts.
3. FAMILY & ALLERGY RULE: If traveler_type is family, proactively ask about allergies in the summary.
4. TIMELINE RULE: If transit waypoints are provided, analyze weather for each stop.
5. INFRASTRUCTURE: If 3+ floods in 20 years for this month + heavy rain forecast, warn of Dam and Levee Vulnerability.
6. HEALTH: Tailor Heat Stress and UV warnings for the traveler_type.
"""


async def run_weather_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    family_members: int = 0,
    known_allergies: list = None,
    transit_waypoints: list = None
) -> dict:

    if known_allergies is None:
        known_allergies = []
    if transit_waypoints is None:
        transit_waypoints = []

    # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "weather",
        city=city,
        start=travel_start_date,
        end=travel_end_date,
        traveler=traveler_type
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[WeatherAgent] Serving from cache")
        return cached

    # ── Step 1: Geocode ───────────────────────────────
    coords = await geocode_city(city)
    if "error" in coords and coords.get("latitude") == 0:
        return {
            "error": f"Could not locate city: {city}",
            "summary": "Weather data unavailable",
            "hazard_risk_assessment": {
                "overall_risk_level": "unknown"
            }
        }

    lat = coords["latitude"]
    lon = coords["longitude"]

    print(f"[WeatherAgent] Geocoded {city} → "
          f"lat={lat}, lon={lon}")

    # ── Step 2: Fetch all data in parallel ────────────
    print("[WeatherAgent] Fetching all data sources "
          "in parallel...")

    results = await asyncio.gather(
        call_openweathermap(city),
        fetch_historical_precipitation(
            lat, lon,
            travel_start_date,
            travel_end_date
        ),
        fetch_reliefweb_disasters(
            country,
            ["Earthquake", "Flood", "Fire",
             "Tsunami", "Landslide"]
        ),
        fetch_ncei_station_data(
            lat, lon,
            travel_start_date,
            travel_end_date
        ),
        fetch_health_and_pollen_data(lat, lon),
        fetch_route_forecast(transit_waypoints),
        fetch_historical_seismic_data(lat, lon),
        fetch_realtime_fires(lat, lon),
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(
            r, Exception) else {"error": str(r)}

    realtime      = safe(results[0])
    hist_precip   = safe(results[1])
    reliefweb     = safe(results[2])
    ncei          = safe(results[3])
    health_pollen = safe(results[4])
    route_weather = safe(results[5])
    seismic_20yr  = safe(results[6])
    fire_data     = safe(results[7])

    print(f"[WeatherAgent] Realtime: "
          f"{'OK' if 'error' not in realtime else 'FAIL'}")
    print(f"[WeatherAgent] Historical: "
          f"{'OK' if 'error' not in hist_precip else 'FAIL'}")
    print(f"[WeatherAgent] Disasters: "
          f"{len(reliefweb) if isinstance(reliefweb, list) else 'FAIL'}")

    # ── Step 3: Mosquito risk ─────────────────────────
    mosq_risk = calculate_mosquito_risk(
        temp=realtime.get(
            "temperature_c", {}).get("current", 25),
        humidity=realtime.get("humidity_percent", 50),
        precip_last_7d=realtime.get(
            "precipitation_mm", {}).get("next_24h", 0),
        wind_speed=realtime.get("wind_speed_kmh", 5)
    )

    # ── Step 4: Build bundle ──────────────────────────
    bundle = {
        "city":             city,
        "country":          country,
        "travel_dates":     (
            f"{travel_start_date} to {travel_end_date}"
        ),
        "traveler_type":    traveler_type,
        "family_members":   family_members,
        "known_allergies":  known_allergies,
        "transit_waypoints_provided": transit_waypoints,
        "realtime_weather": realtime,
        "historical_seismic_20yr": seismic_20yr,
        "thermal_fire_anomalies":  fire_data,
        "historical_precipitation_context": hist_precip,
        "reliefweb_disaster_history": reliefweb,
        "health_and_pollen_data": health_pollen,
        "calculated_mosquito_risk": mosq_risk,
        "route_weather_data": route_weather,
    }

    # ── Step 5: Gemma analysis ────────────────────────
    print("[WeatherAgent] Sending to Gemma...")

    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Perform Deep Calamity Prediction and "
                f"Travel Analysis for {city}:\n\n"
                f"{json.dumps(bundle, indent=2)}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=WEATHER_SYSTEM_PROMPT,
                temperature=0.1,
                max_output_tokens=2048,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)
        parsed["_metadata"] = {
            "seismic_events_found": seismic_20yr.get(
                "total_significant_events", 0)
            if isinstance(seismic_20yr, dict) else 0,
            "fire_hotspots_detected": len(fire_data)
            if isinstance(fire_data, list) else 0,
            "data_retrieval_time": datetime.now().isoformat()
        }

        # ── Cache the result ──────────────────────────
        await set_cache(cache_key, parsed, TTL["weather"])
        return parsed

    except json.JSONDecodeError as e:
        print(f"[WeatherAgent] JSON parse error: {e}")
        return {
            "error": "Gemma response was not valid JSON",
            "raw_response": response.text[:500],
            "summary": f"Weather data collected for {city}.",
            "hazard_risk_assessment": {
                "overall_risk_level": "unknown"
            }
        }
    except Exception as e:
        print(f"[WeatherAgent] Error: {e}")
        return {
            "error": str(e),
            "summary": "Weather analysis failed",
            "hazard_risk_assessment": {
                "overall_risk_level": "unknown"
            }
        }