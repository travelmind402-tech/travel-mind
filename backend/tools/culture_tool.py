import httpx
import asyncio
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

GEOAPIFY_KEY = os.getenv("GEOAPIFY_API_KEY")
TICKETMASTER_KEY = os.getenv("TICKETMASTER_API_KEY")


# ─────────────────────────────────────────────
# TOOL 1 — Local Customs & Etiquette
#          (RestCountries — FREE, no key)
# ─────────────────────────────────────────────
async def fetch_local_customs(country: str) -> dict:
    """
    Fetches country-level metadata: region, subregion,
    languages, currencies, timezones, and calling codes.
    Used by Gemma to generate dos/don'ts and etiquette.
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"https://restcountries.com/v3.1/name/{country}",
                params={"fullText": "false"}
            )
            data = r.json()

            if not data or isinstance(data, dict):
                return {"error": f"Country '{country}' not found"}

            c = data[0]

            # Extract languages safely
            languages = list(c.get("languages", {}).values())

            # Extract currencies safely
            currencies = [
                f"{v.get('name', '')} ({v.get('symbol', '')})"
                for v in c.get("currencies", {}).values()
            ]

            # Extract calling codes safely
            idd = c.get("idd", {})
            root = idd.get("root", "")
            suffixes = idd.get("suffixes", [""])
            calling_code = f"{root}{suffixes[0]}" if suffixes else root

            return {
                "country_name":    c.get("name", {}).get("common", country),
                "official_name":   c.get("name", {}).get("official", country),
                "region":          c.get("region", ""),
                "subregion":       c.get("subregion", ""),
                "capital":         c.get("capital", [""])[0],
                "languages":       languages,
                "currencies":      currencies,
                "timezones":       c.get("timezones", []),
                "calling_code":    calling_code,
                "population":      c.get("population", 0),
                "landlocked":      c.get("landlocked", False),
                "driving_side":    c.get("car", {}).get("side", "right"),
                "source":          "restcountries.com"
            }
    except Exception as e:
        return {"error": str(e), "source": "restcountries.com"}


# ─────────────────────────────────────────────
# TOOL 2 — Festivals & Events
#          (Ticketmaster Discovery API — FREE tier)
# ─────────────────────────────────────────────
async def fetch_festivals_and_events(
    city: str,
    country: str,
    travel_start_date: str,
    travel_end_date: str
) -> list:
    """
    Fetches real upcoming events and festivals at the destination.
    travel_start_date / travel_end_date: "YYYY-MM-DD"
    Falls back to empty list if API key not configured.
    """
    if not TICKETMASTER_KEY:
        return [{"note": "TICKETMASTER_API_KEY not configured — festival data unavailable. Gemma will use knowledge base."}]

    try:
        # Ticketmaster expects ISO 8601 datetime
        start_dt = f"{travel_start_date}T00:00:00Z"
        end_dt   = f"{travel_end_date}T23:59:59Z"

        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params={
                    "apikey":          TICKETMASTER_KEY,
                    "city":            city,
                    "countryCode":     _get_country_code(country),
                    "startDateTime":   start_dt,
                    "endDateTime":     end_dt,
                    "classificationName": "Festival,Music,Arts,Sports,Cultural",
                    "size":            10,
                    "sort":            "date,asc"
                }
            )
            data = r.json()

            embedded = data.get("_embedded", {})
            events   = embedded.get("events", [])

            results = []
            for ev in events:
                dates  = ev.get("dates", {}).get("start", {})
                venue  = ev.get("_embedded", {}).get("venues", [{}])[0]
                genres = [
                    c.get("segment", {}).get("name", "")
                    for c in ev.get("classifications", [])
                    if c.get("segment")
                ]
                results.append({
                    "name":         ev.get("name", ""),
                    "date":         dates.get("localDate", ""),
                    "time":         dates.get("localTime", ""),
                    "venue":        venue.get("name", ""),
                    "address":      venue.get("address", {}).get("line1", ""),
                    "genre":        ", ".join(set(genres)),
                    "info":         ev.get("info", ev.get("pleaseNote", "")),
                    "ticket_url":   ev.get("url", ""),
                    "price_range":  _extract_price(ev.get("priceRanges", [])),
                })

            return results if results else [{"note": f"No events found in {city} for the travel dates."}]

    except Exception as e:
        return [{"error": str(e)}]


def _extract_price(price_ranges: list) -> str:
    if not price_ranges:
        return "Price not listed"
    p = price_ranges[0]
    mn  = p.get("min", "")
    mx  = p.get("max", "")
    cur = p.get("currency", "USD")
    if mn and mx:
        return f"{cur} {mn} – {mx}"
    return "Price not listed"


def _get_country_code(country: str) -> str:
    """
    Maps common country names to ISO 3166-1 alpha-2 codes
    for Ticketmaster API. Extend as needed.
    """
    mapping = {
        "india": "IN", "united states": "US", "usa": "US",
        "united kingdom": "GB", "uk": "GB", "france": "FR",
        "germany": "DE", "japan": "JP", "australia": "AU",
        "canada": "CA", "italy": "IT", "spain": "ES",
        "thailand": "TH", "singapore": "SG", "brazil": "BR",
        "mexico": "MX", "netherlands": "NL", "sweden": "SE",
        "norway": "NO", "denmark": "DK", "new zealand": "NZ",
        "portugal": "PT", "greece": "GR", "turkey": "TR",
        "south korea": "KR", "china": "CN", "indonesia": "ID",
        "malaysia": "MY", "vietnam": "VN", "egypt": "EG",
        "south africa": "ZA", "argentina": "AR", "colombia": "CO",
    }
    return mapping.get(country.lower(), "US")


# ─────────────────────────────────────────────
# TOOL 3 — Language Tips
#          (Open-Meteo Geocode for timezone context
#           + Wikidata SPARQL for language families — FREE, no key)
# ─────────────────────────────────────────────
async def fetch_language_tips(country: str) -> dict:
    """
    Fetches language family, script, and writing system info
    from Wikidata. Used by Gemma to generate traveler phrase tips.
    Falls back gracefully if Wikidata is slow.
    """
    try:
        # Wikidata SPARQL — completely free, no key
        query = f"""
        SELECT ?lang ?langLabel ?iso ?nativeName WHERE {{
          ?country wdt:P31 wd:Q6256 ;
                   rdfs:label "{country}"@en ;
                   wdt:P37 ?lang .
          ?lang wdt:P218 ?iso .
          OPTIONAL {{ ?lang wdt:P1705 ?nativeName }}
          SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" }}
        }}
        LIMIT 5
        """

        async with httpx.AsyncClient(timeout=12) as client:
            r = await client.get(
                "https://query.wikidata.org/sparql",
                params={"query": query, "format": "json"},
                headers={"User-Agent": "TravelMind/1.0 (travel-app)"}
            )
            data = r.json()
            bindings = data.get("results", {}).get("bindings", [])

            languages = []
            for b in bindings:
                languages.append({
                    "name":        b.get("langLabel", {}).get("value", ""),
                    "iso_code":    b.get("iso", {}).get("value", ""),
                    "native_name": b.get("nativeName", {}).get("value", ""),
                })

            return {
                "official_languages": languages,
                "total_found":        len(languages),
                "source":             "wikidata-sparql"
            }

    except Exception as e:
        return {
            "official_languages": [],
            "error": str(e),
            "source": "wikidata-sparql"
        }


# ─────────────────────────────────────────────
# TOOL 4 — Dress Code & Venue Rules
#          (Geoapify Places — FREE tier 3000 req/day)
# ─────────────────────────────────────────────
async def fetch_dress_code_venues(
    lat: float,
    lon: float,
    travel_style: str = "general"
) -> dict:
    """
    Fetches nearby religious sites, formal venues, and
    conservative-dress locations around the destination.
    Geoapify free tier: 3000 requests/day, no credit card.
    """
    if not GEOAPIFY_KEY:
        return {
            "note": "GEOAPIFY_API_KEY not configured — venue data unavailable. Gemma will use knowledge base.",
            "religious_sites_nearby": 0
        }

    # These venue types typically require modest/specific dress
    dress_sensitive_categories = [
        "religion.place_of_worship",
        "religion.mosque",
        "religion.temple",
        "religion.church",
        "entertainment.culture.theatre",
        "entertainment.culture.arts_centre",
        "tourism.attraction",
    ]

    try:
        venue_counts = {}

        async with httpx.AsyncClient(timeout=12) as client:
            tasks = []
            for category in dress_sensitive_categories:
                tasks.append(
                    client.get(
                        "https://api.geoapify.com/v2/places",
                        params={
                            "categories": category,
                            "filter":     f"circle:{lon},{lat},5000",
                            "limit":      5,
                            "apiKey":     GEOAPIFY_KEY
                        }
                    )
                )

            responses = await asyncio.gather(*tasks, return_exceptions=True)

            all_venues = []
            for i, resp in enumerate(responses):
                cat = dress_sensitive_categories[i]
                if isinstance(resp, Exception):
                    venue_counts[cat] = 0
                    continue

                data     = resp.json()
                features = data.get("features", [])
                venue_counts[cat] = len(features)

                for f in features[:2]:  # Top 2 per category
                    props = f.get("properties", {})
                    all_venues.append({
                        "name":     props.get("name", "Unnamed"),
                        "category": cat.split(".")[-1],
                        "address":  props.get("formatted", ""),
                    })

        religious_count = sum(
            v for k, v in venue_counts.items()
            if "religion" in k
        )

        return {
            "religious_sites_nearby":  religious_count,
            "formal_venues_nearby":    venue_counts.get("entertainment.culture.theatre", 0)
                                     + venue_counts.get("entertainment.culture.arts_centre", 0),
            "top_venues_sample":       all_venues[:6],
            "dress_sensitive_zone":    religious_count > 2,
            "venue_category_counts":   venue_counts,
            "travel_style":            travel_style,
            "source":                  "geoapify"
        }

    except Exception as e:
        return {
            "error": str(e),
            "religious_sites_nearby": 0,
            "source": "geoapify"
        }