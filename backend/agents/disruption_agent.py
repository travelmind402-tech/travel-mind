import json
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv
from datetime import datetime

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

Your job is to extract structured disruption events that 
would affect a traveler visiting this destination.

Focus on finding:
- Road closures or flooding on specific routes
- Trail or attraction closures due to weather
- Activity cancellations (boat rides, treks, tours)
- Power outages and their typical duration
- Transport disruptions (buses, taxis unavailable)
- Hotel or accommodation issues during bad weather
- Scam alerts specific to bad weather situations
- Mobile network or ATM failures during storms

Respond ONLY in this JSON format, no other text:
{
  "destination": "...",
  "travel_month": "...",
  "data_quality": "high | medium | low",
  "total_reports_analyzed": 0,
  "disruption_hotspots": [
    {
      "location": "specific place name or route",
      "disruption_type": "road_flood | trail_closure | activity_cancellation | power_outage | transport | accommodation | scam | network_failure",
      "frequency": "always | often | sometimes | rarely",
      "frequency_detail": "e.g. 3 out of 5 recent Junes",
      "typical_duration": "e.g. 1-3 days",
      "trigger_condition": "e.g. rainfall above 50mm in 24hrs",
      "traveler_reports_count": 0,
      "last_reported": "approximate date or year",
      "severity": "critical | high | medium | low",
      "advisory": "specific actionable advice for traveler",
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
  "positive_notes": [
    "things that work well even in bad weather"
  ],
  "best_backup_plans": [
    "specific backup plan if main attraction is closed"
  ],
  "overall_disruption_risk": "high | medium | low",
  "confidence_level": "high | medium | low",
  "data_freshness": "recent | moderate | old"
}
"""

SEARCH_QUERIES = [
    "{city} {month} travel disruption flood road closure",
    "{city} {month} monsoon road blocked landslide traveler",
    "{city} travel tips {month} problems issues reddit",
    "{city} tourist attraction closed {month} weather",
    "visiting {city} {month} what to expect problems",
    "{city} power outage {month} travel experience",
    "site:reddit.com {city} travel {month} disruption",
    "site:tripadvisor.com {city} {month} review warning",
]


async def search_and_extract(
    query: str,
    city: str,
    month_name: str
) -> str:
    """
    Tries web search first, falls back to 
    Gemma knowledge if search unavailable.
    """
    # Try with web search first
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Search for and summarize recent "
                f"traveler reports about: {query}"
            ),
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
                temperature=0.1,
                max_output_tokens=1024,
            )
        )
        print(f"[DisruptionAgent] Web search succeeded")
        return response.text

    except Exception as search_error:
        print(f"[DisruptionAgent] Web search failed: "
              f"{search_error}")
        print(f"[DisruptionAgent] Falling back to "
              f"Gemma knowledge...")

        # Fallback — use Gemma's training knowledge
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
            print(f"[DisruptionAgent] Fallback also "
                  f"failed: {fallback_error}")
            return ""


async def run_disruption_agent(
    city: str,
    country: str,
    travel_month: int,
    travel_year: int,
    traveler_type: str
) -> dict:

    month_name = MONTH_NAMES.get(travel_month, "June")

    print(f"[DisruptionAgent] Starting crowd-sourced "
          f"disruption scan for {city} in {month_name}...")

    # ── Step 1: Run targeted searches ────────────────
    # Run 4 most targeted queries
    # (limit to avoid rate limits)
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
                "query": query,
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

    print(f"[DisruptionAgent] Got {len(search_results)} "
          f"search results. Extracting disruptions...")

    # ── Step 2: Combine all search findings ───────────
    combined_findings = "\n\n---\n\n".join([
        f"Search Query: {r['query']}\n"
        f"Findings:\n{r['findings']}"
        for r in search_results
    ])

    # ── Step 3: Extract structured disruptions ────────
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

        # Add metadata
        parsed["_metadata"] = {
            "searches_performed": len(search_results),
            "city": city,
            "country": country,
            "travel_month": month_name,
            "travel_year": travel_year,
            "traveler_type": traveler_type,
            "generated_at": datetime.now().isoformat(),
            "approach": "gemma_web_search"
        }

        print(f"[DisruptionAgent] Found "
              f"{len(parsed.get('disruption_hotspots', []))} "
              f"disruption hotspots")

        return parsed

    except json.JSONDecodeError as e:
        print(f"[DisruptionAgent] JSON parse error: {e}")
        return {
            "error": "Could not parse disruption data",
            "raw_findings": combined_findings[:1000],
            "destination": city,
            "disruption_hotspots": [],
            "overall_disruption_risk": "unknown",
            "confidence_level": "low"
        }
    except Exception as e:
        print(f"[DisruptionAgent] Error: {e}")
        return {
            "error": str(e),
            "destination": city,
            "disruption_hotspots": [],
            "overall_disruption_risk": "unknown",
            "confidence_level": "low"
        }