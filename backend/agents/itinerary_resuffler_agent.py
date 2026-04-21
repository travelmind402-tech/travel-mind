import asyncio
import json
import os
from datetime import datetime, timedelta
from google import genai
from google.genai import types
from dotenv import load_dotenv
from tools.weather_tool import (
    fetch_daily_forecast_for_reshuffler,
    fetch_exchange_rate
)

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY")
)

RESHUFFLER_SYSTEM_PROMPT = """
You are an expert travel itinerary optimizer.

You receive:
1. A list of planned activities with their type 
   (outdoor / indoor / flexible)
2. A day-by-day weather forecast with outdoor scores
3. Traveler preferences (avoid heat, avoid rain etc)

Your job is to assign each activity to the best possible
day based on weather, then generate a complete optimized
day-by-day itinerary.

Rules you must follow:
- Outdoor activities MUST go on high outdoor_score days (>60)
- Indoor activities SHOULD go on low outdoor_score days (<40)
- Flexible activities fill gaps wherever they fit best
- Never schedule more hours than available in a day
  (daily_start_time to daily_end_time)
- If avoid_extreme_heat is true, move all outdoor activities
  away from days with temp_max > 35°C
- If avoid_rain_completely is true, never put any activity
  on a day with rain_mm > 5
- If a day has rain only in the morning (rain_window =
  morning_or_evening), outdoor activities can still go
  in the afternoon
- Always include a meal break (1 hour lunch, 1 hour dinner)
- For elderly travelers, limit outdoor activity to max
  3 hours per day and schedule rest periods
- Flag any activities that could not be optimally placed
  and explain why
- BUDGET RULE: You will receive daily_budget_local and
  total_budget_local in the traveler's local currency.
  You will also receive currency and currency_symbol.
  Every activity has an estimated_cost_local field
  showing cost in local currency.
  Make sure the total cost of all activities assigned
  across all days does not exceed total_budget_local.
  Always show ALL money amounts in local currency
  using the currency_symbol provided.
  Never show USD amounts in the response — always
  convert to local currency using the exchange_rate
  provided in the bundle.
- If an activity costs too much given remaining budget
  mark it as "budget_constrained" and suggest a
  free or cheaper alternative.
- In each day's schedule show the running budget spent
  and remaining budget for the trip.
- Prioritize free or low cost activities on days where
  budget is running low.
- Always include estimated meal costs in daily budget
  tracking (use local average pricing knowledge).

Respond ONLY in this JSON format, no other text:
{
  "optimized_itinerary": [
    {
      "date": "YYYY-MM-DD",
      "day_number": 1,
      "weather_summary": "...",
      "outdoor_score": 0,
      "day_type": "excellent | good | poor | bad",
      "schedule": [
        {
          "time": "09:00",
          "activity": "...",
          "activity_type": "outdoor | indoor | flexible",
          "duration_hours": 2.0,
          "estimated_cost_usd": 0,
          "weather_suitability": "perfect | good | acceptable | forced",
          "tip": "short practical tip for this activity on this day",
          "budget_status": "within_budget | tight | over_budget",
          "cheaper_alternative": "null | alternative if over budget"
        }
      ],
      "day_budget_summary": {
        "activities_cost_usd": 0,
        "meals_cost_usd": 0,
        "transport_cost_usd": 0,
        "total_day_cost_usd": 0,
        "remaining_trip_budget_usd": 0
      },
      "meals": [
        {
          "time": "13:00",
          "type": "lunch",
          "suggestion": "one line local food suggestion"
        },
        {
          "time": "19:00",
          "type": "dinner",
          "suggestion": "one line local food suggestion"
        }
      ],
      "daily_notes": "any weather warnings or special advice for this day",
      "rain_advisory": "null | specific rain timing warning"
    }
  ],
  "reshuffled_activities": [
    {
      "activity": "...",
      "original_preferred_date": "...",
      "assigned_date": "...",
      "reason_for_change": "..."
    }
  ],
  "unplaceable_activities": [
    {
      "activity": "...",
      "reason": "...",
      "suggestion": "..."
    }
  ],
  "overall_trip_weather_rating": "excellent | good | mixed | poor",
  "best_day_of_trip": "YYYY-MM-DD",
  "worst_day_of_trip": "YYYY-MM-DD",
  "key_warnings": ["...", "..."],
  "packing_recommendations": ["...", "...", "..."],
  "budget_summary": {
    "total_trip_budget_usd": 0,
    "estimated_total_spend_usd": 0,
    "estimated_savings_usd": 0,
    "most_expensive_day": "YYYY-MM-DD",
    "cheapest_day": "YYYY-MM-DD",
    "budget_feasibility": "comfortable | tight | over_budget",
    "money_saving_tips": ["...", "...", "..."]
    }
  }
"""


def _build_activity_summary(activities: list) -> str:
    """
    Converts activity list to a clean text summary
    for Gemma to reason over.
    """
    lines = []
    for i, act in enumerate(activities):
        line = (
            f"{i+1}. {act['name']} "
            f"[{act['type']}] "
            f"— {act['duration_hours']}hrs"
        )
        if act.get("preferred_date"):
            line += f" (preferred: {act['preferred_date']})"
        if act.get("notes"):
            line += f" | note: {act['notes']}"
        lines.append(line)
    return "\n".join(lines)


def _calculate_available_hours(
    start_time: str,
    end_time: str,
    meal_hours: float = 2.0
) -> float:
    """
    Calculates usable activity hours in a day
    minus meal breaks.
    """
    fmt = "%H:%M"
    start = datetime.strptime(start_time, fmt)
    end   = datetime.strptime(end_time,   fmt)
    total = (end - start).seconds / 3600
    return total - meal_hours


def _score_activity_day_fit(
    activity_type: str,
    day: dict,
    avoid_heat: bool,
    avoid_rain: bool
) -> int:
    """
    Pure Python scoring — how well an activity fits
    a given day. Higher = better fit.
    Used to pre-sort before sending to Gemma.
    """
    score = day.get("outdoor_score", 50)

    if activity_type == "outdoor":
        # Outdoor loves high score days
        fit = score
        if avoid_heat and day.get("temp_max_c", 25) > 35:
            fit -= 40
        if avoid_rain and day.get("rain_mm", 0) > 5:
            fit -= 50
        return fit

    elif activity_type == "indoor":
        # Indoor loves low score days (save good days
        # for outdoor)
        fit = 100 - score
        return fit

    else:
        # Flexible — moderately good days are fine
        return 50


async def run_itinerary_agent(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str,
    traveler_type: str,
    activities: list,
    daily_start_time: str = "09:00",
    daily_end_time:   str = "21:00",
    avoid_extreme_heat:     bool = False,
    avoid_rain_completely:  bool = False,
    daily_budget_usd:       float = 50.0,    # ← added
    total_trip_budget_usd:  float = None,     # ← added
    currency:               str = "INR"
) -> dict:

    print(f"[ItineraryAgent] Fetching forecast for "
          f"{city} ({travel_start_date} to "
          f"{travel_end_date})...")

    # ── Step 1: Get day-by-day forecast ──────────────
    forecast_days = await fetch_daily_forecast_for_reshuffler(
        city,
        travel_start_date,
        travel_end_date
    )

    if not forecast_days or "error" in forecast_days[0]:
        return {
            "error": "Could not fetch forecast for "
                     "itinerary planning",
            "optimized_itinerary": []
        }

    print(f"[ItineraryAgent] Got {len(forecast_days)} "
          f"days of forecast data")
    # ── Fetch live exchange rate ──────────────────────
    exchange = await fetch_exchange_rate("USD", currency)
    rate      = exchange.get("rate", 1.0)
    symbol    = {
        "INR": "₹", "EUR": "€", "GBP": "£",
        "JPY": "¥", "AUD": "A$", "CAD": "C$",
        "SGD": "S$", "THB": "฿", "USD": "$",
        "BDT": "৳", "NPR": "Rs"
    }.get(currency, currency)

    print(f"[ItineraryAgent] Exchange rate: "
          f"1 USD = {rate} {currency}")

    # Convert budgets to local currency
    daily_budget_local = round(daily_budget_usd * rate, 2)
    total_budget_local = round(
        (total_trip_budget_usd
         if total_trip_budget_usd
         else daily_budget_usd * trip_days) * rate, 2
    )

    # Convert activity costs to local currency
    for act in activities:
        act["estimated_cost_local"] = round(
            act.get("estimated_cost_usd", 0) * rate, 2
        )
        act["cost_display"] = (
            f"{symbol}"
            f"{act['estimated_cost_local']:,.0f} {currency}"
        )

    # ── Step 2: Pre-score in Python ───────────────────
    # Give Gemma a hint about which activities fit
    # which days before it does full reasoning
    activity_fit_hints = []
    for act in activities:
        day_scores = []
        for day in forecast_days:
            fit = _score_activity_day_fit(
                act["type"],
                day,
                avoid_extreme_heat,
                avoid_rain_completely
            )
            day_scores.append({
                "date": day["date"],
                "fit_score": fit
            })
        # Sort by best fit
        day_scores.sort(
            key=lambda x: x["fit_score"],
            reverse=True
        )
        activity_fit_hints.append({
            "activity": act["name"],
            "type": act["type"],
            "best_days": [
                d["date"] for d in day_scores[:3]
            ],
            "worst_days": [
                d["date"] for d in day_scores[-2:]
            ]
        })

    available_hours = _calculate_available_hours(
        daily_start_time,
        daily_end_time
    )

    # ── Step 3: Build bundle for Gemma ───────────────
    # Calculate total trip budget if not provided
    trip_days = (
        datetime.strptime(travel_end_date, "%Y-%m-%d") -
        datetime.strptime(travel_start_date, "%Y-%m-%d")
    ).days + 1

    total_budget = (
        total_trip_budget_usd
        if total_trip_budget_usd
        else daily_budget_usd * trip_days
    )

    bundle = {
        "city":              city,
        "country":           country,
        "travel_dates":      (
            f"{travel_start_date} to {travel_end_date}"
        ),
        "traveler_type":     traveler_type,
        "daily_start_time":  daily_start_time,
        "daily_end_time":    daily_end_time,
        "available_hours_per_day": available_hours,
        "avoid_extreme_heat":    avoid_extreme_heat,
        "avoid_rain_completely": avoid_rain_completely,
        "daily_budget_usd":      daily_budget_usd,
        "total_trip_budget_usd": total_budget,
        "trip_days":             trip_days,
        "currency":              currency,
        "currency_symbol":       symbol,
        "exchange_rate":         f"1 USD = {rate} {currency}",
        "daily_budget_local":    daily_budget_local,
        "total_budget_local":    total_budget_local,
        "budget_display":        (
            f"{symbol}{daily_budget_local:,.0f} "
            f"{currency}/day | "
            f"{symbol}{total_budget_local:,.0f} "
            f"{currency} total"
        ),
        "planned_activities": _build_activity_summary(
            activities
        ),

        "day_by_day_forecast": forecast_days,

        "python_fit_analysis": activity_fit_hints,

        "forecast_summary": {
            "total_days": len(forecast_days),
            "excellent_days": sum(
                1 for d in forecast_days
                if d["day_type"] == "excellent"
            ),
            "good_days": sum(
                1 for d in forecast_days
                if d["day_type"] == "good"
            ),
            "poor_days": sum(
                1 for d in forecast_days
                if d["day_type"] == "poor"
            ),
            "bad_days": sum(
                1 for d in forecast_days
                if d["day_type"] == "bad"
            ),
            "best_outdoor_day": max(
                forecast_days,
                key=lambda d: d.get("outdoor_score", 0)
            )["date"],
            "worst_outdoor_day": min(
                forecast_days,
                key=lambda d: d.get("outdoor_score", 100)
            )["date"],
        }
    }

    print(f"[ItineraryAgent] Sending to Gemma for "
          f"optimization...")
    print(f"[ItineraryAgent] Forecast summary: "
          f"{bundle['forecast_summary']}")

    # ── Step 4: Gemma optimization ────────────────────
    try:
        response = client.models.generate_content(
            model="gemma-4-31b-it",
            contents=(
                f"Optimize this itinerary for {city} "
                f"based on the weather forecast:\n\n"
                f"{json.dumps(bundle, indent=2)}"
            ),
            config=types.GenerateContentConfig(
                system_instruction=RESHUFFLER_SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=4096,
            )
        )

        text = response.text.strip()
        text = text.replace(
            "```json", "").replace("```", "").strip()

        parsed = json.loads(text)

        # ── Step 5: Attach raw forecast for frontend ──
        parsed["_forecast_data"] = forecast_days
        parsed["_city"] = city
        parsed["_generated_at"] = datetime.now().isoformat()

        return parsed

    except json.JSONDecodeError as e:
        print(f"[ItineraryAgent] JSON parse error: {e}")
        return {
            "error": "Gemma response parsing failed",
            "raw_response": response.text[:500],
            "forecast_available": forecast_days
        }

    except Exception as e:
        print(f"[ItineraryAgent] Error: {e}")
        return {
            "error": str(e),
            "optimized_itinerary": []
        }