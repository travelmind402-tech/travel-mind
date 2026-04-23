import asyncio
import json
import os
from google import genai
from google.genai import types
from datetime import datetime
from dotenv import load_dotenv

from tools.culture_tool import (
    fetch_local_customs,
    fetch_festivals_and_events,
    fetch_language_tips,
    fetch_dress_code_venues,
)
from utils.cache import build_cache_key, get_cache, set_cache, TTL
from tools.weather_tool import geocode_city

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY"))

CULTURE_SYSTEM_PROMPT = """You are a Master Cultural Intelligence Analyst and Travel Etiquette Expert.
Your goal is to give travelers a deep, practical, and respectful cultural briefing for their destination.

Respond ONLY in this JSON format:
{
  "summary": "...",
  "destination_overview": {
    "cultural_identity": "Brief cultural character of the destination",
    "primary_religion": "...",
    "social_conservatism_level": "Conservative | Moderate | Liberal",
    "traveler_friendliness": "High | Medium | Low",
    "best_cultural_experience": "One sentence on the single best cultural thing to do here"
  },
  "customs_and_etiquette": {
    "greeting_style": "...",
    "dining_etiquette": [],
    "dos": [],
    "donts": [],
    "tipping_culture": "...",
    "bargaining_culture": "...",
    "punctuality_norm": "...",
    "physical_contact_norms": "..."
  },
  "dress_code_guide": {
    "general_street_wear": "...",
    "religious_sites": "...",
    "beach_or_resort": "...",
    "formal_dining_or_theatre": "...",
    "conservative_areas_nearby": true,
    "packing_dress_tips": []
  },
  "language_guide": {
    "official_languages": [],
    "script_used": "Latin | Devanagari | Arabic | Cyrillic | Kanji | etc.",
    "english_proficiency": "High | Medium | Low",
    "essential_phrases": [
      { "phrase": "Hello", "local": "...", "pronunciation": "..." },
      { "phrase": "Thank you", "local": "...", "pronunciation": "..." },
      { "phrase": "Please", "local": "...", "pronunciation": "..." },
      { "phrase": "Excuse me", "local": "...", "pronunciation": "..." },
      { "phrase": "Where is...?", "local": "...", "pronunciation": "..." },
      { "phrase": "How much?", "local": "...", "pronunciation": "..." },
      { "phrase": "I don't understand", "local": "...", "pronunciation": "..." },
      { "phrase": "Help!", "local": "...", "pronunciation": "..." }
    ],
    "useful_scripts_tip": "..."
  },
  "festivals_and_events": {
    "during_travel_dates": [],
    "cultural_significance": "...",
    "crowd_impact_warning": "..."
  },
  "religious_and_sacred_sites": {
    "major_sites_nearby": [],
    "behavior_rules": [],
    "photography_rules": "..."
  },
  "local_laws_travelers_must_know": [],
  "cultural_sensitivity_score": {
    "score": "1-10",
    "explanation": "...",
    "risk_level": "Low | Medium | High"
  },
  "traveler_type_specific_tips": {
    "advice": "..."
  },
  "emergency_phrases": [
    { "phrase": "Call the police", "local": "..." },
    { "phrase": "I need a doctor", "local": "..." }
  ],
  "overall_cultural_readiness_tips": []
}

Rules you must follow:
1. DRESS CODE RULE: If religious_sites_nearby > 2, set conservative_areas_nearby to true and include specific clothing advice (covered shoulders, long pants/skirts, head covering if required).
2. TRAVELER TYPE RULE: Tailor traveler_type_specific_tips to the traveler_type field (solo, family, couple, student, elderly, business).
3. LANGUAGE RULE: Always provide 8 essential phrases with accurate local script and pronunciation guide. For non-Latin scripts, include both the script and romanized pronunciation.
4. FESTIVALS RULE: Cross-reference festivals_and_events data with travel dates. If a major festival falls during travel, add a crowd_impact_warning.
5. LAWS RULE: Always include 3-5 local laws that could catch foreign travelers off-guard (e.g. no gum in Singapore, drone laws, photography restrictions).
6. SENSITIVITY SCORE: Rate the destination 1-10 on cultural sensitivity required (10 = extremely conservative like Saudi Arabia, 1 = very relaxed like Amsterdam).
7. SUMMARY: Write a vivid 2-sentence cultural character summary of the destination. Mention the dominant cultural flavour and one unique thing.
"""


async def run_culture_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    travel_style: str = "general",
    group_size: int = 1,
    known_sensitivities: list = None,
) -> dict:

    if known_sensitivities is None:
        known_sensitivities = []
        # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "culture",
        city=city,
        country=country,
        traveler=traveler_type,
        style=travel_style
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[CultureAgent] Serving from cache")
        return cached

    # ── Step 1: Geocode city ──────────────────────────
    coords = await geocode_city(city)
    if "error" in coords:
        return {"error": f"Could not locate city: {city}"}

    lat, lon = coords["latitude"], coords["longitude"]

    # ── Step 2: Parallel data fetch ───────────────────
    print(f"[CultureAgent] Running cultural intelligence scan for {city}, {country}...")

    results = await asyncio.gather(
        fetch_local_customs(country),
        fetch_festivals_and_events(city, country, travel_start_date, travel_end_date),
        fetch_language_tips(country),
        fetch_dress_code_venues(lat, lon, travel_style),
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(r, Exception) else {"error": str(r)}

    customs_data  = safe(results[0])
    festivals     = safe(results[1])
    language_data = safe(results[2])
    venue_data    = safe(results[3])

    # ── Step 3: Bundle everything for Gemma ───────────
    bundle = {
        "city":                 city,
        "country":              country,
        "travel_dates":         f"{travel_start_date} to {travel_end_date}",
        "traveler_type":        traveler_type,
        "travel_style":         travel_style,
        "group_size":           group_size,
        "known_sensitivities":  known_sensitivities,
        "country_metadata":     customs_data,
        "live_events_festivals": festivals,
        "language_data":        language_data,
        "venue_and_dress_data": venue_data,
    }

    # ── Step 4: Send to Gemma for synthesis ───────────
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=f"Generate a complete Cultural Intelligence Briefing for a traveler visiting {city}, {country}:\n\n{json.dumps(bundle, indent=2)}",
            config=types.GenerateContentConfig(
                system_instruction=CULTURE_SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=2048,
            )
        )

        text   = response.text.strip().replace("```json", "").replace("```", "").strip()
        parsed = json.loads(text)

        # Add metadata for debugging
        parsed["_metadata"] = {
            "festivals_found":       len(festivals) if isinstance(festivals, list) else 0,
            "languages_found":       language_data.get("total_found", 0),
            "religious_sites_nearby": venue_data.get("religious_sites_nearby", 0),
            "data_retrieval_time":   datetime.now().isoformat()
        }
        # ── Cache result ──────────────────────────────
        await set_cache(cache_key, parsed, TTL["culture"])

        return parsed

    except Exception as e:
        return {
            "error": str(e),
            "summary": "The culture engine encountered an error during synthesis.",
            "cultural_sensitivity_score": {"score": "unknown", "risk_level": "unknown"}
        }