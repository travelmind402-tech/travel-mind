import json
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from datetime import datetime
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

MONTH_NAMES = {
    1: "January", 2: "February", 3: "March",
    4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September",
    10: "October", 11: "November", 12: "December"
}

EXTRACTION_PROMPT = """
You are a travel disruption intelligence analyst.
You will receive raw text from traveler reports, Reddit posts,
and travel reviews about a specific destination.

Extract structured disruption events that would affect
a traveler visiting this destination.

Respond ONLY in this JSON format, no other text:
{
  "destination": "...",
  "travel_month": "...",
  "data_quality": "high | medium | low",
  "total_reports_analyzed": 0,
  "disruption_hotspots": [
    {
      "location": "...",
      "disruption_type": "road_flood | trail_closure | activity_cancellation | power_outage | transport | accommodation | scam | network_failure",
      "frequency": "always | often | sometimes | rarely",
      "frequency_detail": "...",
      "typical_duration": "...",
      "trigger_condition": "...",
      "traveler_reports_count": 0,
      "last_reported": "...",
      "severity": "critical | high | medium | low",
      "advisory": "...",
      "source_types": ["reddit", "tripadvisor", "google_maps"]
    }
  ],
  "power_situation": {
    "outage_frequency": "daily | weekly | rarely | never",
    "typical_duration_hours": "...",
    "advisory": "..."
  },
  "transport_situation": {
    "local_transport_reliability": "high | medium | low",
    "surge_pricing_risk": true,
    "advisory": "..."
  },
  "connectivity_situation": {
    "mobile_network_risk": "high | medium | low",
    "atm_reliability": "high | medium | low",
    "advisory": "..."
  },
  "scam_alerts": [
    {
      "scam_type": "...",
      "location": "...",
      "how_to_avoid": "..."
    }
  ],
  "positive_notes": ["..."],
  "best_backup_plans": ["..."],
  "overall_disruption_risk": "high | medium | low",
  "confidence_level": "high | medium | low",
  "data_freshness": "recent | moderate | old"
}
"""


async def search_and_extract(
    query: str,
    city: str,
    month_name: str
) -> str:
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Search for recent traveler experiences "
                f"and reports about this topic and "
                f"summarize what you find. Focus on "
                f"real disruptions, problems, and issues "
                f"travelers faced:\n\n{query}"
            ),
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
                temperature=0.1,
                max_output_tokens=1024,
            )
        )
        return response.text
    except Exception as search_error:
        print(f"[DisruptionAgent] Web search failed: "
              f"{search_error}")
        try:
            fallback = client.models.generate_content(
                model="gemma-4-31b-it",
                contents=(
                    f"Based on your knowledge, what are "
                    f"common travel disruptions, road "
                    f"closures, attraction issues and "
                    f"problems travelers face when "
                    f"visiting {city} in {month_name}? "
                    f"Include specific locations, routes, "
                    f"and practical traveler advice."
                ),
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=1024,
                )
            )
            return fallback.text
        except Exception as fallback_error:
            print(f"[DisruptionAgent] Fallback failed: "
                  f"{fallback_error}")
            return ""


async def run_disruption_agent(
    city: str,
    country: str,
    travel_month: int,
    travel_year: int,
    traveler_type: str
) -> dict:

    month_name = MONTH_NAMES.get(travel_month, "June")

    # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "disruption",
        city=city,
        month=travel_month,
        year=travel_year
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[DisruptionAgent] Serving from cache")
        return cached

    print(f"[DisruptionAgent] Starting disruption scan "
          f"for {city} in {month_name}...")

    # ── Search queries ────────────────────────────────
    priority_queries = [
        f"{city} {month_name} road closure flood "
        f"landslide travel",
        f"{city} {month_name} tourist problems "
        f"disruption reddit",
        f"{city} {month_name} travel tips warnings "
        f"what to expect",
        f"{city} power outage transport issues "
        f"{month_name} traveler"
    ]

    search_results = []
    for query in priority_queries:
        print(f"[DisruptionAgent] Searching: {query}")
        result = await search_and_extract(
            query, city, month_name
        )
        if result:
            search_results.append({
                "query":    query,
                "findings": result
            })

    if not search_results:
        return {
            "error": "No search results returned",
            "destination": city,
            "disruption_hotspots": [],
            "overall_disruption_risk": "unknown",
            "confidence_level": "low"
        }

    print(f"[DisruptionAgent] Got "
          f"{len(search_results)} results. "
          f"Extracting disruptions...")

    # ── Combine findings ──────────────────────────────
    combined_findings = "\n\n---\n\n".join([
        f"Search Query: {r['query']}\n"
        f"Findings:\n{r['findings']}"
        for r in search_results
    ])

    # ── Extract structured data ───────────────────────
    try:
        extraction_response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Extract all travel disruption events "
                f"for {city}, {country} in {month_name} "
                f"from these traveler reports:\n\n"
                f"{combined_findings}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_PROMPT,
                temperature=0.1,
                max_output_tokens=2048,
            )
        )

        text = extraction_response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)
        parsed["_metadata"] = {
            "searches_performed": len(search_results),
            "city":          city,
            "country":       country,
            "travel_month":  month_name,
            "travel_year":   travel_year,
            "traveler_type": traveler_type,
            "generated_at":  datetime.now().isoformat(),
            "approach":      "gemma_web_search"
        }

        # ── Cache result ──────────────────────────────
        await set_cache(
            cache_key, parsed, TTL["disruption"]
        )

        print(f"[DisruptionAgent] Found "
              f"{len(parsed.get('disruption_hotspots', []))}"
              f" hotspots")

        return parsed

    except json.JSONDecodeError as e:
        print(f"[DisruptionAgent] JSON parse error: {e}")
        return {
            "error": "Could not parse disruption data",
            "destination": city,
            "disruption_hotspots": [],
            "overall_disruption_risk": "unknown",
            "confidence_level": "low"
        }
    except Exception as e:
        print(f"[DisruptionAgent] Error: {e}")
        return {
            "error":       str(e),
            "destination": city,
            "disruption_hotspots": [],
            "overall_disruption_risk": "unknown",
            "confidence_level": "low"
        }