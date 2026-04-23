import asyncio
import json
import os
from datetime import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tools.cuisine_tool import (
    search_restaurants_foursquare,
    search_places_geoapify,
    fetch_food_markets,
    classify_budget_level,
    merge_restaurant_data,
    map_price_level_to_cost
)
from tools.weather_tool import fetch_exchange_rate
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

CUISINE_KNOWLEDGE_PROMPT = """
You are a local food and cuisine expert for travelers.
Given a destination, provide deep cuisine knowledge.

Respond ONLY in this JSON format, no other text:
{
  "cuisine_overview": {
    "food_culture": "...",
    "signature_ingredients": ["...", "..."],
    "eating_customs": "...",
    "tipping_at_restaurants": "...",
    "meal_timings": {
      "breakfast": "...",
      "lunch": "...",
      "dinner": "..."
    },
    "current_season_specials": ["...", "..."]
  },
  "must_try_dishes": [
    {
      "dish_name": "...",
      "description": "...",
      "estimated_cost_usd": 0,
      "dietary_tags": ["vegetarian | vegan | halal | gluten_free"],
      "seasonal_availability": "year_round | seasonal | rare",
      "ordering_tip": "...",
      "where_to_find": "street_stall | local_restaurant | upscale"
    }
  ],
  "street_food_guide": {
    "best_areas": ["...", "..."],
    "safety_rating": "high | medium | low",
    "best_time_to_visit": "...",
    "must_try_street_foods": ["...", "..."],
    "hygiene_tips": ["...", "..."],
    "average_meal_cost_usd": 0
  },
  "dietary_accommodation": {
    "vegetarian_friendly": true,
    "vegan_options": "...",
    "halal_availability": "...",
    "gluten_free_options": "...",
    "allergy_warning": "..."
  },
  "local_drinks": {
    "non_alcoholic": ["...", "..."],
    "alcoholic": ["...", "..."],
    "water_safety": "safe | boil | bottle_only",
    "best_local_cafe": "..."
  },
  "tourist_trap_foods": [
    {
      "item": "...",
      "location": "...",
      "warning": "...",
      "better_alternative": "..."
    }
  ],
  "food_experiences": [
    {
      "experience": "...",
      "description": "...",
      "estimated_cost_usd": 0,
      "duration": "..."
    }
  ],
  "emergency_food": "...",
  "budget_meal_plan": {
    "cheap_breakfast": "...",
    "cheap_lunch": "...",
    "cheap_dinner": "...",
    "daily_food_budget_usd_minimum": 0,
    "daily_food_budget_usd_comfortable": 0
  }
}
"""

CUISINE_MERGE_PROMPT = """
You are a local food expert and travel advisor.
You receive cuisine knowledge, live restaurant listings,
food markets, user budget and dietary preferences.

Merge all data into one complete practical cuisine guide.

Rules:
- Always show costs in local currency using currency_symbol
- Filter restaurants that exceed daily_budget_local
- Mark each restaurant as within_budget/tight/over_budget
- Highlight dietary-friendly options based on restrictions
- Put tourist trap warnings prominently
- Give specific ordering tips for each must-try dish
- Include local language name of each dish

Respond ONLY in this JSON format, no other text:
{
  "destination": "...",
  "currency_used": "...",
  "cuisine_overview": {},
  "must_try_dishes": [
    {
      "dish_name": "...",
      "local_name": "...",
      "description": "...",
      "estimated_cost_local": "...",
      "dietary_tags": [],
      "seasonal_availability": "...",
      "ordering_tip": "...",
      "where_to_find": "..."
    }
  ],
  "recommended_restaurants": [
    {
      "name": "...",
      "cuisine_type": "...",
      "rating": 0,
      "price_level": "...",
      "estimated_cost_per_person_local": "...",
      "address": "...",
      "opening_hours": "...",
      "must_order": ["...", "..."],
      "best_for": "...",
      "budget_fit": "within | tight | over",
      "dietary_options": ["..."],
      "insider_tip": "..."
    }
  ],
  "street_food_guide": {
    "best_areas": [],
    "safety_rating": "...",
    "best_time_to_visit": "...",
    "must_try_street_foods": [],
    "hygiene_tips": [],
    "average_meal_cost_local": "..."
  },
  "food_markets": [
    {
      "name": "...",
      "type": "...",
      "best_time": "...",
      "what_to_buy": [],
      "address": "..."
    }
  ],
  "dietary_accommodation": {},
  "budget_meal_plan": {
    "breakfast_options": [],
    "lunch_options": [],
    "dinner_options": [],
    "daily_food_budget_estimate_local": "...",
    "money_saving_tips": []
  },
  "local_drinks": {},
  "tourist_trap_foods": [],
  "food_experiences": [],
  "seasonal_specials": [],
  "emergency_food": "...",
  "overall_food_rating": "excellent | good | average | poor"
}
"""


async def _get_cuisine_knowledge(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    dietary_restrictions: list
) -> dict:
    try:
        restrictions_text = (
            f"Dietary restrictions: "
            f"{', '.join(dietary_restrictions)}"
            if dietary_restrictions
            else "No dietary restrictions"
        )

        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Give me deep cuisine knowledge for "
                f"{city}, {country}. "
                f"Travel dates: {travel_start_date} "
                f"to {travel_end_date}. "
                f"{restrictions_text}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=CUISINE_KNOWLEDGE_PROMPT,
                temperature=0.3,
                max_output_tokens=2048,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()
        return json.loads(text)

    except Exception as e:
        print(f"[CuisineAgent] Knowledge error: {e}")
        return {}


async def run_cuisine_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    daily_budget: float = 4000.0,
    currency: str = "INR",
    dietary_restrictions: list = None,
    cuisine_preferences: str = "all",
    group_size: int = 1
) -> dict:

    if dietary_restrictions is None:
        dietary_restrictions = []

    # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "cuisine",
        city=city,
        currency=currency,
        dietary=str(sorted(dietary_restrictions)),
        preference=cuisine_preferences
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[CuisineAgent] Serving from cache")
        return cached

    print(f"[CuisineAgent] Starting cuisine analysis "
          f"for {city}...")

    # ── Exchange rate ─────────────────────────────────
    exchange     = await fetch_exchange_rate(
        currency, "USD"
    )
    rate_to_usd  = exchange.get("rate", 1.0)
    symbol       = {
        "INR": "₹", "EUR": "€", "GBP": "£",
        "JPY": "¥", "AUD": "A$", "CAD": "C$",
        "SGD": "S$", "THB": "฿", "USD": "$",
        "BDT": "৳", "NPR": "Rs"
    }.get(currency, currency)

    daily_budget_local = daily_budget
    daily_budget_usd   = round(
        daily_budget * rate_to_usd, 2
    )
    food_budget_local  = round(
        daily_budget_local * 0.35, 2
    )

    print(f"[CuisineAgent] Budget: "
          f"{symbol}{daily_budget_local} {currency}/day "
          f"≈ ${daily_budget_usd} USD")

    budget_level = classify_budget_level(daily_budget_usd)

    # ── Fetch all data in parallel ────────────────────
    print(f"[CuisineAgent] Fetching data in parallel...")

    results = await asyncio.gather(
        _get_cuisine_knowledge(
            city, country,
            travel_start_date, travel_end_date,
            dietary_restrictions
        ),
        search_restaurants_foursquare(
            city, budget_level, limit=10
        ),
        search_places_geoapify(
            city,
            place_type="catering.restaurant",
            limit=10
        ),
        fetch_food_markets(city),
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(
            r, Exception) else {}

    cuisine_knowledge = safe(results[0])
    foursquare_data   = results[1] if not isinstance(
        results[1], Exception) else []
    geoapify_data     = results[2] if not isinstance(
        results[2], Exception) else []
    markets_data      = safe(results[3])

    print(f"[CuisineAgent] Foursquare: "
          f"{len(foursquare_data)} restaurants")
    print(f"[CuisineAgent] Geoapify: "
          f"{len(geoapify_data)} restaurants")

    # ── Merge restaurants ─────────────────────────────
    merged_restaurants = merge_restaurant_data(
        foursquare_data,
        geoapify_data
    )

    # Get exchange rate for display
    exchange_display = await fetch_exchange_rate(
        "USD", currency
    )
    rate_display = exchange_display.get("rate", 1.0)

    for rest in merged_restaurants:
        price_level = rest.get("price_level", 1)
        rest["estimated_cost_per_person_local"] = \
            map_price_level_to_cost(
                price_level, rate_display, symbol
            )

    print(f"[CuisineAgent] Merged: "
          f"{len(merged_restaurants)} restaurants")

    # ── Build bundle ──────────────────────────────────
    bundle = {
        "city":                city,
        "country":             country,
        "travel_dates":        (
            f"{travel_start_date} to {travel_end_date}"
        ),
        "traveler_type":       traveler_type,
        "group_size":          group_size,
        "currency":            currency,
        "currency_symbol":     symbol,
        "exchange_rate":       (
            f"1 USD = {rate_display} {currency}"
        ),
        "daily_budget_usd":    daily_budget_usd,
        "daily_budget_local":  daily_budget_local,
        "food_budget_local":   food_budget_local,
        "budget_level":        budget_level,
        "dietary_restrictions": dietary_restrictions,
        "cuisine_preferences": cuisine_preferences,
        "cuisine_knowledge":   cuisine_knowledge,
        "live_restaurants":    merged_restaurants,
        "food_markets":        markets_data,
    }

    # ── Gemma merge ───────────────────────────────────
    print(f"[CuisineAgent] Sending to Gemma...")

    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Create a complete cuisine guide for "
                f"{city}, {country} using this data:\n\n"
                f"{json.dumps(bundle, indent=2)}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=CUISINE_MERGE_PROMPT,
                temperature=0.3,
                max_output_tokens=3000,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)
        parsed["_metadata"] = {
            "restaurants_found": len(merged_restaurants),
            "data_sources":      [
                "gemma", "foursquare", "geoapify"
            ],
            "budget_level":      budget_level,
            "currency":          currency,
            "exchange_rate":     exchange_display.get(
                "example"
            ),
            "generated_at":      datetime.now().isoformat()
        }

        # ── Cache result ──────────────────────────────
        await set_cache(
            cache_key, parsed, TTL["cuisine"]
        )
        return parsed

    except json.JSONDecodeError as e:
        print(f"[CuisineAgent] JSON parse error: {e}")
        return {
            "error":            "Response parsing failed",
            "cuisine_knowledge": cuisine_knowledge,
            "restaurants":      merged_restaurants,
            "destination":      city
        }
    except Exception as e:
        print(f"[CuisineAgent] Error: {e}")
        return {
            "error":       str(e),
            "destination": city
        }