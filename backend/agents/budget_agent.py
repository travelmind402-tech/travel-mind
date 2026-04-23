import asyncio
import json
import os
from datetime import datetime
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tools.budget_tool import (
    search_hotels_booking,     
    search_transport_ors,
    calculate_trip_days,
    classify_budget_tier,
    
)
from utils.cache import build_cache_key, get_cache, set_cache, TTL
from tools.weather_tool import fetch_exchange_rate

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY")
)

BUDGET_SYSTEM_PROMPT = """
You are an expert travel budget planner who knows
local costs in every city worldwide.

You receive:
1. Destination city and country
2. Daily budget in local currency
3. Live hotel data from Amadeus API
4. Transport options from Rome2Rio
5. Budget tier classification

Your job is to produce a complete trip budget plan.

Rules:
- All money amounts MUST be in local currency using currency_symbol
- Never show USD unless specifically asked
- Be realistic — use actual local pricing knowledge
- For student travelers: always highlight free options first
- For elderly travelers: always add accessibility cost notes
- Flag hidden costs travelers always miss

Respond ONLY in this JSON format, no other text:
{
  "destination": "...",
  "trip_summary": {
    "total_days": 0,
    "total_budget_local": "...",
    "budget_tier": "backpacker | budget | mid_range | luxury",
    "budget_feasibility": "very_tight | tight | comfortable | generous",
    "daily_budget_local": "..."
  },
  "daily_breakdown": {
    "accommodation": {
      "estimated_cost_local": "...",
      "recommended_type": "...",
      "options": ["...", "..."],
      "money_saving_tip": "..."
    },
    "food": {
      "estimated_cost_local": "...",
      "breakfast_options": ["...", "..."],
      "lunch_options": ["...", "..."],
      "dinner_options": ["...", "..."],
      "street_food_avg_local": "...",
      "restaurant_avg_local": "...",
      "money_saving_tip": "..."
    },
    "local_transport": {
      "estimated_cost_local": "...",
      "recommended_options": ["...", "..."],
      "money_saving_tip": "..."
    },
    "activities": {
      "estimated_cost_local": "...",
      "free_options": ["...", "..."],
      "paid_options": ["...", "..."],
      "money_saving_tip": "..."
    },
    "misc": {
      "estimated_cost_local": "...",
      "typical_items": ["sim card", "laundry", "tips"]
    }
  },
  "total_trip_estimate": {
    "minimum_local": "...",
    "comfortable_local": "...",
    "daily_average_local": "..."
  },
  "recommended_hotels": [
    {
      "name": "...",
      "type": "hostel | budget | mid_range | luxury",
      "price_per_night_local": "...",
      "rating": "...",
      "best_for": "...",
      "booking_tip": "..."
    }
  ],
  "transport_to_destination": {
    "options": [
      {
        "mode": "...",
        "duration": "...",
        "estimated_cost_local": "...",
        "recommendation": "..."
      }
    ],
    "cheapest_option": "...",
    "fastest_option": "..."
  },
  "hidden_costs_warning": [
    {
      "item": "...",
      "estimated_cost_local": "...",
      "how_to_avoid": "..."
    }
  ],
  "money_saving_hacks": ["...", "...", "..."],
  "student_discounts": ["...", "..."],
  "free_things_to_do": ["...", "...", "..."],
  "emergency_fund_recommendation_local": "...",
  "atm_and_payment_tips": "...",
  "currency_advice": "..."
}
"""


async def run_budget_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    daily_budget: float = 3000.0,
    currency: str = "INR",
    group_size: int = 1,
    accommodation_preference: str = "any",
    transport_mode: str = "any",
    include_flights: bool = False
) -> dict:

    print(f"[BudgetAgent] Starting budget planning "
          f"for {city}...")
    # ── Cache check ───────────────────────────────────
    cache_key = build_cache_key(
        "budget",
        city=city,
        start=travel_start_date,
        end=travel_end_date,
        traveler=traveler_type,
        budget=str(daily_budget),
        currency=currency
    )
    cached = await get_cache(cache_key)
    if cached:
        print(f"[BudgetAgent] Serving from cache")
        return cached

    # ── Step 1: Get exchange rate ─────────────────────
    exchange      = await fetch_exchange_rate(currency, "USD")
    rate_to_usd   = exchange.get("rate", 0.012)
    exchange_back = await fetch_exchange_rate("USD", currency)
    rate_to_local = exchange_back.get("rate", 83.5)

    symbol = {
        "INR": "₹", "EUR": "€", "GBP": "£",
        "JPY": "¥", "AUD": "A$", "CAD": "C$",
        "SGD": "S$", "THB": "฿", "USD": "$",
        "BDT": "৳", "NPR": "Rs"
    }.get(currency, currency)

    daily_budget_usd = round(daily_budget * rate_to_usd, 2)
    trip_days        = calculate_trip_days(
        travel_start_date, travel_end_date
    )
    total_budget_usd   = round(daily_budget_usd * trip_days, 2)
    total_budget_local = round(daily_budget * trip_days, 2)

    print(f"[BudgetAgent] {trip_days} days | "
          f"{symbol}{daily_budget} {currency}/day | "
          f"≈ ${daily_budget_usd} USD/day")

    # ── Step 2: Budget tier classification ───────────
    budget_tier = classify_budget_tier(
        daily_budget_usd, traveler_type
    )
    max_hotel_usd = budget_tier["distribution_usd"][
        "accommodation"
    ]

    # ── Step 3: Run all data fetches in parallel ──────
    print(f"[BudgetAgent] Fetching hotels and "
          f"transport in parallel...")

    async def _empty():
        return {"options": []}

    results = await asyncio.gather(
        search_hotels_booking(
            city,
            travel_start_date,
            travel_end_date,
            adults=group_size,
            max_price_usd=max_hotel_usd * 1.5
        ),
        search_transport_ors(
            country, city
        ) if include_flights else _empty(),
        return_exceptions=True
    )

    def safe(r):
        return r if not isinstance(
            r, Exception) else {}

    hotels    = results[0] if not isinstance(
        results[0], Exception) else []
    transport = safe(results[1])

    # Convert hotel prices to local currency
    for h in hotels:
        h["price_per_night_local"] = round(
            h.get("price_usd", 0) * rate_to_local, 0
        )
        h["price_display"] = (
            f"{symbol}"
            f"{h['price_per_night_local']:,.0f}/night"
        )

    # Convert transport prices to local currency
    if transport.get("options"):
        for opt in transport["options"]:
            opt["price_local"] = round(
                opt.get("price_usd", 0) * rate_to_local, 0
            )
            opt["price_display"] = (
                f"{symbol}{opt['price_local']:,.0f}"
            )

    print(f"[BudgetAgent] Hotels found: {len(hotels)}")
    print(f"[BudgetAgent] Sending to Gemma...")

    # ── Step 4: Build bundle for Gemma ───────────────
    bundle = {
        "city":                   city,
        "country":                country,
        "travel_dates":           (
            f"{travel_start_date} to {travel_end_date}"
        ),
        "trip_days":              trip_days,
        "traveler_type":          traveler_type,
        "group_size":             group_size,
        "currency":               currency,
        "currency_symbol":        symbol,
        "exchange_rate":          (
            f"1 USD = {rate_to_local} {currency}"
        ),
        "daily_budget_local":     daily_budget,
        "daily_budget_usd":       daily_budget_usd,
        "total_budget_local":     total_budget_local,
        "total_budget_usd":       total_budget_usd,
        "accommodation_preference": accommodation_preference,
        "transport_mode":         transport_mode,
        "budget_tier":            budget_tier,
        "live_hotels_from_amadeus": hotels,
        "transport_options_rome2rio": transport,
    }

    # ── Step 5: Gemma budget planning ────────────────
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Create a complete budget plan for "
                f"{traveler_type} traveler going to "
                f"{city}, {country}:\n\n"
                f"{json.dumps(bundle, indent=2)}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=BUDGET_SYSTEM_PROMPT,
                temperature=0.2,
                max_output_tokens=3000,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)
        parsed["_metadata"] = {
            "hotels_found":    len(hotels),
            "trip_days":       trip_days,
            "currency":        currency,
            "exchange_rate":   exchange_back.get("example"),
            "generated_at":    datetime.now().isoformat()
        }
        
        # ── Cache result ──────────────────────────────
        await set_cache(cache_key, parsed, TTL["budget"])
        return parsed

    except json.JSONDecodeError as e:
        print(f"[BudgetAgent] JSON parse error: {e}")
        return {
            "error":       "Response parsing failed",
            "raw_hotels":  hotels,
            "destination": city,
            "trip_days":   trip_days
        }
    except Exception as e:
        print(f"[BudgetAgent] Error: {e}")
        return {
            "error":       str(e),
            "destination": city
        }