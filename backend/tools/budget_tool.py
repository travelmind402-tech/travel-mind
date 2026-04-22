import httpx
import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv
from tools.weather_tool import geocode_city, fetch_exchange_rate

load_dotenv()

RAPIDAPI_KEY  = os.getenv("RAPIDAPI_KEY")
ORS_KEY       = os.getenv("OPENROUTESERVICE_KEY")


# ─────────────────────────────────────────────
# TOOL 1 — Booking.com hotel search
#          (via RapidAPI — FREE 100 calls/month)
# ─────────────────────────────────────────────
async def search_hotels_booking(
    city: str,
    check_in: str,
    check_out: str,
    adults: int = 1,
    max_price_usd: float = 100.0
) -> list:
    if not RAPIDAPI_KEY:
        print("[BudgetTool] RAPIDAPI_KEY missing")
        return []

    try:
        async with httpx.AsyncClient(timeout=15) as client:

            # Step 1 — Search destination ID
            dest_r = await client.get(
                "https://booking-com15.p.rapidapi.com"
                "/api/v1/hotels/searchDestination",
                headers={
                    "X-RapidAPI-Key":  RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "booking-com15.p.rapidapi.com"
                },
                params={"query": city}
            )

            print(f"[BudgetTool] Destination search "
                  f"status: {dest_r.status_code}")

            dest_data = dest_r.json().get("data", [])
            if not dest_data:
                print(f"[BudgetTool] No destination "
                      f"found for {city}")
                return []

            dest_id   = dest_data[0].get("dest_id", "")
            dest_type = dest_data[0].get(
                "dest_type", "city")

            print(f"[BudgetTool] Found destination: "
                  f"{dest_id} ({dest_type})")

            # Step 2 — Search hotels
            hotel_r = await client.get(
                "https://booking-com15.p.rapidapi.com"
                "/api/v1/hotels/searchHotels",
                headers={
                    "X-RapidAPI-Key":  RAPIDAPI_KEY,
                    "X-RapidAPI-Host": "booking-com15.p.rapidapi.com"
                },
                params={
                    "dest_id":         dest_id,
                    "search_type":     dest_type,
                    "arrival_date":    check_in,
                    "departure_date":  check_out,
                    "adults":          adults,
                    "room_qty":        1,
                    "page_number":     1,
                    "units":           "metric",
                    "temperature_unit": "c",
                    "languagecode":    "en-us",
                    "currency_code":   "USD",
                    "sort_by":         "popularity"
                }
            )

            print(f"[BudgetTool] Hotel search "
                  f"status: {hotel_r.status_code}")

            if hotel_r.status_code != 200:
                print(f"[BudgetTool] Hotel error: "
                      f"{hotel_r.text[:200]}")
                return []

            hotels_raw = hotel_r.json().get(
                "data", {}).get("hotels", [])

            print(f"[BudgetTool] Raw hotels found: "
                  f"{len(hotels_raw)}")

            hotels = []
            for h in hotels_raw[:10]:
                prop         = h.get(
                    "property", {})
                price_info   = prop.get(
                    "priceBreakdown", {})
                gross        = price_info.get(
                    "grossPrice", {})
                price_val    = float(
                    gross.get("value", 0))

                # Skip if over budget
                if price_val > max_price_usd * 1.5:
                    continue

                review_score = prop.get(
                    "reviewScore", 0)
                review_word  = prop.get(
                    "reviewScoreWord", "")
                review_count = prop.get(
                    "reviewCount", 0)

                hotels.append({
                    "name":         prop.get("name", ""),
                    "rating":       review_score,
                    "review_word":  review_word,
                    "review_count": review_count,
                    "price_usd":    round(price_val, 2),
                    "price_per_night_usd": round(
                        price_val, 2),
                    "property_type": prop.get(
                        "propertyClass", 0),
                    "checkin_time":  prop.get(
                        "checkinDate", check_in),
                    "checkout_time": prop.get(
                        "checkoutDate", check_out),
                    "photo_url":     prop.get(
                        "photoUrls", [""])[0],
                    "source":        "booking.com"
                })

            return sorted(
                hotels,
                key=lambda x: x["price_usd"]
            )[:5]

    except Exception as e:
        print(f"[BudgetTool] Booking.com error: {e}")
        return []


# ─────────────────────────────────────────────
# TOOL 2 — OpenRouteService transport
#          (FREE — no credit card needed)
# ─────────────────────────────────────────────
async def search_transport_ors(
    origin_city: str,
    destination_city: str
) -> dict:
    if not ORS_KEY:
        print("[BudgetTool] OPENROUTESERVICE_KEY missing")
        return {"error": "ORS key missing", "options": []}

    try:
        # Geocode both cities
        origin_coords, dest_coords = await asyncio.gather(
            geocode_city(origin_city),
            geocode_city(destination_city)
        )

        if "error" in origin_coords or \
           "error" in dest_coords:
            return {
                "error": "Could not geocode cities",
                "options": []
            }

        o_lat = origin_coords["latitude"]
        o_lon = origin_coords["longitude"]
        d_lat = dest_coords["latitude"]
        d_lon = dest_coords["longitude"]

        # Calculate straight-line distance in km
        import math
        dlat  = math.radians(d_lat - o_lat)
        dlon  = math.radians(d_lon - o_lon)
        a     = (math.sin(dlat/2)**2 +
                 math.cos(math.radians(o_lat)) *
                 math.cos(math.radians(d_lat)) *
                 math.sin(dlon/2)**2)
        dist_km = round(
            6371 * 2 * math.asin(math.sqrt(a)), 1
        )

        transport_options = []

        # ── Driving route ─────────────────────────────
        async with httpx.AsyncClient(timeout=15) as client:
            drive_r = await client.post(
                "https://api.openrouteservice.org"
                "/v2/directions/driving-car",
                headers={
                    "Authorization": ORS_KEY,
                    "Content-Type":  "application/json"
                },
                json={
                    "coordinates": [
                        [o_lon, o_lat],
                        [d_lon, d_lat]
                    ]
                }
            )

            print(f"[BudgetTool] ORS driving status: "
                  f"{drive_r.status_code}")

            if drive_r.status_code == 200:
                route_data = drive_r.json()
                summary    = route_data.get(
                    "routes", [{}])[0].get(
                    "summary", {})
                dist_m     = summary.get("distance", 0)
                duration_s = summary.get("duration", 0)
                dist_road  = round(dist_m / 1000, 1)
                hours      = round(duration_s / 3600, 1)

                # Estimate fuel cost
                fuel_cost_usd = round(
                    (dist_road / 12) * 1.2, 2
                )  # 12km/L, $1.2/L avg

                transport_options.append({
                    "mode":           "car / taxi",
                    "distance_km":    dist_road,
                    "duration_hours": hours,
                    "estimated_fuel_cost_usd": fuel_cost_usd,
                    "price_usd":      fuel_cost_usd,
                    "notes":          (
                        "Fuel cost only. Add tolls "
                        "and taxi fare if applicable."
                    ),
                    "source": "openrouteservice"
                })

        # ── Walking route (short distances only) ──────
        if dist_km < 50:
            async with httpx.AsyncClient(
                timeout=15
            ) as client:
                walk_r = await client.post(
                    "https://api.openrouteservice.org"
                    "/v2/directions/foot-walking",
                    headers={
                        "Authorization": ORS_KEY,
                        "Content-Type":  "application/json"
                    },
                    json={
                        "coordinates": [
                            [o_lon, o_lat],
                            [d_lon, d_lat]
                        ]
                    }
                )

                if walk_r.status_code == 200:
                    walk_data = walk_r.json()
                    walk_sum  = walk_data.get(
                        "routes", [{}])[0].get(
                        "summary", {})
                    walk_hrs  = round(
                        walk_sum.get(
                            "duration", 0) / 3600, 1
                    )

                    transport_options.append({
                        "mode":           "walking",
                        "distance_km":    round(
                            walk_sum.get(
                                "distance", 0
                            ) / 1000, 1),
                        "duration_hours": walk_hrs,
                        "price_usd":      0,
                        "notes":          "Free option",
                        "source":         "openrouteservice"
                    })

        # ── Public transport estimate (pure Python) ───
        # ORS doesn't do public transit — estimate from
        # distance
        if dist_km < 500:
            bus_cost    = round(dist_km * 0.02, 2)
            bus_hours   = round(dist_km / 50, 1)
            train_cost  = round(dist_km * 0.015, 2)
            train_hours = round(dist_km / 80, 1)

            transport_options.append({
                "mode":           "bus",
                "distance_km":    dist_km,
                "duration_hours": bus_hours,
                "price_usd":      bus_cost,
                "notes":          "Estimated local bus cost",
                "source":         "estimated"
            })

            transport_options.append({
                "mode":           "train",
                "distance_km":    dist_km,
                "duration_hours": train_hours,
                "price_usd":      train_cost,
                "notes":          (
                    "Estimated train cost. "
                    "Book on IRCTC for India."
                ),
                "source": "estimated"
            })

        # ── Flight estimate (long distance only) ──────
        if dist_km > 400:
            if dist_km < 1000:
                flight_cost = round(
                    50 + dist_km * 0.05, 2)
            else:
                flight_cost = round(
                    100 + dist_km * 0.04, 2)

            transport_options.append({
                "mode":           "flight",
                "distance_km":    dist_km,
                "duration_hours": round(
                    dist_km / 800, 1),
                "price_usd":      flight_cost,
                "notes":          (
                    "Estimated budget airline price. "
                    "Check Google Flights for live prices."
                ),
                "source": "estimated"
            })

        return {
            "origin":         origin_city,
            "destination":    destination_city,
            "distance_km":    dist_km,
            "options":        sorted(
                transport_options,
                key=lambda x: x["price_usd"]
            )
        }

    except Exception as e:
        print(f"[BudgetTool] ORS error: {e}")
        return {"error": str(e), "options": []}


# ─────────────────────────────────────────────
# TOOL 3 — Trip days calculator (Pure Python)
# ─────────────────────────────────────────────
def calculate_trip_days(
    travel_start_date: str,
    travel_end_date: str
) -> int:
    start = datetime.strptime(
        travel_start_date, "%Y-%m-%d")
    end   = datetime.strptime(
        travel_end_date,   "%Y-%m-%d")
    return max((end - start).days, 1)


# ─────────────────────────────────────────────
# TOOL 4 — Budget tier classifier (Pure Python)
# ─────────────────────────────────────────────
def classify_budget_tier(
    daily_budget_usd: float,
    traveler_type: str
) -> dict:
    if daily_budget_usd < 20:
        tier = "backpacker"
    elif daily_budget_usd < 60:
        tier = "budget"
    elif daily_budget_usd < 150:
        tier = "mid_range"
    else:
        tier = "luxury"

    food_pct      = 0.35 if traveler_type == "student" \
                    else 0.30
    accomm_pct    = 0.25 if traveler_type == "student" \
                    else 0.40
    transport_pct  = 0.20
    activities_pct = 0.15
    misc_pct       = round(
        1.0 - food_pct - accomm_pct -
        transport_pct - activities_pct, 2
    )

    return {
        "tier": tier,
        "daily_budget_usd": daily_budget_usd,
        "distribution_usd": {
            "accommodation": round(
                daily_budget_usd * accomm_pct, 2),
            "food":          round(
                daily_budget_usd * food_pct, 2),
            "transport":     round(
                daily_budget_usd * transport_pct, 2),
            "activities":    round(
                daily_budget_usd * activities_pct, 2),
            "misc":          round(
                daily_budget_usd * misc_pct, 2),
        }
    }