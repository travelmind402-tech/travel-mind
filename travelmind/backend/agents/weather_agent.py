import asyncio
import json
import os
from google import genai
from google.genai import types
from datetime import datetime, timedelta
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
    fetch_historical_seismic_data, # 20yr Seismic Tool
    fetch_realtime_fires           # NASA FIRMS Tool
)

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY"))

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
1. DISASTER PREDICTION: Analyze 20-year seismic history. If 'max_magnitude' > 6.0 AND soil moisture is > 80%, predict HIGH risk of 'Soil Liquefaction.' If Urban + Mag 6.5+ history, warn of 'Broken Gas Lines.'
2. SEASONAL DETECTION: Identify the exact local season based on travel dates. Mention seasonal scents (Petrichor, Pine) and economic impacts (Taxi surges, etc.).
3. FAMILY & ALLERGY RULE: If traveler_type is 'family', proactively ask about allergies for Mother, Father, or children in the summary. Predict regional pollens (e.g. Sugi in Japan, Parthenium in India) based on the season.
4. TIMELINE RULE: If transit waypoints are provided, analyze the weather for each stop and flag transit warnings.
5. INFRASTRUCTURE: If 3+ floods in 20 years for this month + heavy rain forecast, warn of 'Dam and Levee Vulnerability.'
6. HEALTH: Tailor Heat Stress and UV warnings for the traveler_type (Elderly/Student/Family).
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
    
    if known_allergies is None: known_allergies = []
    if transit_waypoints is None: transit_waypoints = []

    # ── Step 1: Geocode city ──────────────────────────
    coords = await geocode_city(city)
    if "error" in coords:
        return {"error": f"Could not locate city: {city}"}

    lat, lon = coords["latitude"], coords["longitude"]

    # ── Step 2: Deep Scan Data Fetch (Parallel) ───────
    print(f"[MasterAgent] Running 20-year calamity scan and travel analysis for {city}...")
    results = await asyncio.gather(
        call_openweathermap(city),
        fetch_historical_precipitation(lat, lon, travel_start_date, travel_end_date),
        fetch_reliefweb_disasters(country, ["Earthquake", "Flood", "Fire", "Tsunami", "Landslide"]),
        fetch_ncei_station_data(lat, lon, travel_start_date, travel_end_date),
        fetch_health_and_pollen_data(lat, lon), 
        fetch_route_forecast(transit_waypoints),
        fetch_historical_seismic_data(lat, lon), # 20-Year USGS
        fetch_realtime_fires(lat, lon),          # NASA FIRMS
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(r, Exception) else {"error": str(r)}

    realtime      = safe(results[0])
    hist_precip   = safe(results[1])
    reliefweb     = safe(results[2])
    ncei          = safe(results[3])
    health_pollen = safe(results[4])
    route_weather = safe(results[5])
    seismic_20yr  = safe(results[6])
    fire_data     = safe(results[7])

    # ── Step 3: Calculate Biological/Physical Risks ───
    # We use 5-year precip history as a proxy for recent moisture
    precip_history = hist_precip.get("historical_5yr_precip", [])
    recent_moisture_sum = sum([d.get("total_mm", 0) for d in precip_history]) if isinstance(precip_history, list) else 0

    mosq_risk = calculate_mosquito_risk(
        temp=realtime.get("temperature_c", {}).get("current", 25),
        humidity=realtime.get("humidity", 50),
        precip_last_7d=recent_moisture_sum,
        wind_speed=realtime.get("wind", {}).get("speed", 5)
    )

    # ── Step 4: Bundle everything for Gemma ───────────
    bundle = {
        "city": city,
        "country": country,
        "travel_dates": f"{travel_start_date} to {travel_end_date}",
        "traveler_type": traveler_type,
        "family_members": family_members,
        "known_allergies": known_allergies,
        "transit_waypoints_provided": transit_waypoints,
        "realtime_weather": realtime,
        "historical_seismic_20yr": seismic_20yr,
        "thermal_fire_anomalies": fire_data,
        "historical_precipitation_context": hist_precip,
        "reliefweb_disaster_history": reliefweb,
        "health_and_pollen_data": health_pollen,
        "calculated_mosquito_risk": mosq_risk,
        "route_weather_data": route_weather,
        "soil_moisture_level": health_pollen.get("soil_moisture_0_to_7cm", "N/A")
    }

    # ── Step 5: Send to Gemma for Deep Synthesis ──────
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=f"Perform Deep Calamity Prediction and Travel Analysis for {city}:\n\n{json.dumps(bundle, indent=2)}",
            config=types.GenerateContentConfig(
                system_instruction=WEATHER_SYSTEM_PROMPT,
                temperature=0.1, # Low temperature for high factual precision
                max_output_tokens=2048,
            )
        )
        
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)
        
        # Add metadata for debugging
        parsed["_metadata"] = {
            "seismic_events_found": seismic_20yr.get("total_significant_events", 0) if isinstance(seismic_20yr, dict) else 0,
            "fire_hotspots_detected": len(fire_data) if isinstance(fire_data, list) else 0,
            "data_retrieval_time": datetime.now().isoformat()
        }
        
        return parsed

    except Exception as e:
        return {
            "error": str(e),
            "summary": "The prediction engine encountered an error during synthesis.",
            "hazard_risk_assessment": {"overall_risk_level": "unknown"}
        }