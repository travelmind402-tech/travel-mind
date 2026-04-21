# Graph Report - C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind  (2026-04-21)

## Corpus Check
- 27 files · ~17,618 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 106 nodes · 140 edges · 29 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `run_weather_agent()` - 12 edges
2. `WeatherRequest` - 9 edges
3. `ItineraryRequest` - 8 edges
4. `DisruptionRequest` - 8 edges
5. `DrivingRequest` - 8 edges
6. `run_driving_agent()` - 7 edges
7. `analyse_route_conditions()` - 7 edges
8. `fetch_daily_forecast_for_reshuffler()` - 7 edges
9. `run_itinerary_agent()` - 6 edges
10. `geocode_city()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `reshuffle_itinerary()` --calls--> `run_itinerary_agent()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\main.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\itinerary_agent.py
- `get_driving_conditions()` --calls--> `run_driving_agent()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\main.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\driving_agent.py
- `run_itinerary_agent()` --calls--> `fetch_daily_forecast_for_reshuffler()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\itinerary_agent.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\tools\weather_tool.py
- `run_weather_agent()` --calls--> `geocode_city()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\weather_agent.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\tools\weather_tool.py
- `run_weather_agent()` --calls--> `fetch_reliefweb_disasters()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\weather_agent.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\tools\weather_tool.py

## Hyperedges (group relationships)
- **Backend Python Dependencies** — req_fastapi, req_google_genai, req_uvicorn, req_python_dotenv, req_httpx, req_geopy, req_aiohttp [EXTRACTED 1.00]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (18): get_weather(), run_weather_agent(), calculate_mosquito_risk(), call_openweathermap(), fetch_health_and_pollen_data(), fetch_health_outbreaks(), fetch_historical_precipitation(), fetch_historical_seismic_data() (+10 more)

### Community 1 - "Community 1"
Cohesion: 0.28
Nodes (17): BaseModel, Direct test of the forecast tool.     Remove this endpoint after debugging., Searches real traveler reports, Reddit posts and     travel reviews to find cro, Tests if Gemma web search tool is available     on your API key., Produces a day-by-day driving safety score     and road condition advisory for, Test endpoint for the weather agent only., Test endpoint for the weather agent only., Takes a list of planned activities and     optimizes them around the weather fo (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.22
Nodes (13): run_driving_agent(), analyse_route_conditions(), calculate_driving_score(), classify_terrain(), fetch_elevation(), Gets elevation at a specific coordinate.     Used to detect mountain/hill roads, Analyses driving conditions for each     waypoint along the route., Classifies terrain type based on elevation. (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (7): Tries web search first, falls back to      Gemma knowledge if search unavailabl, run_disruption_agent(), search_and_extract(), debug_search(), get_crowd_disruptions(), get_driving_conditions(), reshuffle_itinerary()

### Community 4 - "Community 4"
Cohesion: 0.36
Nodes (7): _build_activity_summary(), _calculate_available_hours(), Converts activity list to a clean text summary     for Gemma to reason over., Calculates usable activity hours in a day     minus meal breaks., Pure Python scoring — how well an activity fits     a given day. Higher = bette, run_itinerary_agent(), _score_activity_day_fit()

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (2): get_history(), save_message()

### Community 6 - "Community 6"
Cohesion: 0.5
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 1.0
Nodes (2): FastAPI, Uvicorn

### Community 8 - "Community 8"
Cohesion: 1.0
Nodes (2): aiohttp, HTTPX

### Community 9 - "Community 9"
Cohesion: 1.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (1): Google GenAI

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (1): python-dotenv

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (1): geopy

## Knowledge Gaps
- **23 isolated node(s):** `Tries web search first, falls back to      Gemma knowledge if search unavailabl`, `Converts activity list to a clean text summary     for Gemma to reason over.`, `Calculates usable activity hours in a day     minus meal breaks.`, `Pure Python scoring — how well an activity fits     a given day. Higher = bette`, `Gets elevation at a specific coordinate.     Used to detect mountain/hill roads` (+18 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 7`** (2 nodes): `FastAPI`, `Uvicorn`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (2 nodes): `aiohttp`, `HTTPX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (1 nodes): `orchestrator.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (1 nodes): `budget_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `cuisine_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `culture_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `language_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `helpers.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `travelmind.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `Chat.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `Onboarding.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `useStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Google GenAI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `python-dotenv`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `geopy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_weather_agent()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `fetch_daily_forecast_for_reshuffler()` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `run_itinerary_agent()` connect `Community 4` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `run_weather_agent()` (e.g. with `get_weather()` and `geocode_city()`) actually correct?**
  _`run_weather_agent()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `WeatherRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`WeatherRequest` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `ItineraryRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`ItineraryRequest` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `DisruptionRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`DisruptionRequest` has 6 INFERRED edges - model-reasoned connections that need verification._