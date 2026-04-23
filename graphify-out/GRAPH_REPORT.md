# Graph Report - C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind  (2026-04-23)

## Corpus Check
- 45 files · ~33,936 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 198 nodes · 407 edges · 43 communities detected
- Extraction: 38% EXTRACTED · 62% INFERRED · 0% AMBIGUOUS · INFERRED: 252 edges (avg confidence: 0.58)
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
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]

## God Nodes (most connected - your core abstractions)
1. `WeatherRequest` - 31 edges
2. `ItineraryRequest` - 31 edges
3. `DisruptionRequest` - 31 edges
4. `DrivingRequest` - 31 edges
5. `CuisineRequest` - 31 edges
6. `CultureRequest` - 24 edges
7. `BudgetRequest` - 16 edges
8. `run_weather_agent()` - 15 edges
9. `run_cuisine_agent()` - 13 edges
10. `run_budget_agent()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `get_weather()` --calls--> `run_weather_agent()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\main.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\weather_agent.py
- `reshuffle_itinerary()` --calls--> `run_itinerary_agent()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\main.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\itinerary_resuffler_agent.py
- `get_driving_conditions()` --calls--> `run_driving_agent()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\main.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\driving_agent.py
- `run_budget_agent()` --calls--> `calculate_trip_days()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\budget_agent.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\tools\budget_tool.py
- `run_budget_agent()` --calls--> `classify_budget_tier()`  [INFERRED]
  C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\agents\budget_agent.py → C:\Users\dibya\OneDrive\Desktop\Excellence\travelmind\backend\tools\budget_tool.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.29
Nodes (36): Direct test of the forecast tool.     Remove this endpoint after debugging., Direct test of the forecast tool.     Remove this endpoint after debugging., Direct test of the forecast tool.     Remove this endpoint after debugging., Searches real traveler reports, Reddit posts and     travel reviews to find cro, Searches real traveler reports, Reddit posts and     travel reviews to find cro, Searches real traveler reports, Reddit posts and     travel reviews to find cro, Tests if Gemma web search tool is available     on your API key., Tests if Gemma web search tool is available     on your API key. (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): run_budget_agent(), calculate_trip_days(), classify_budget_tier(), search_hotels_booking(), search_transport_ors(), build_cache_key(), cache_or_fetch(), delete_cache() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.16
Nodes (17): run_weather_agent(), calculate_mosquito_risk(), call_openweathermap(), fetch_health_and_pollen_data(), fetch_health_outbreaks(), fetch_historical_precipitation(), fetch_historical_seismic_data(), fetch_ncei_station_data() (+9 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (15): _get_cuisine_knowledge(), run_cuisine_agent(), classify_budget_level(), fetch_food_markets(), map_price_level_to_cost(), merge_restaurant_data(), Searches places using Geoapify Places API.     place_types:       catering.res, Fetches food markets and street food zones     using Geoapify. (+7 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (13): run_culture_agent(), _extract_price(), fetch_dress_code_venues(), fetch_festivals_and_events(), fetch_language_tips(), fetch_local_customs(), _get_country_code(), Maps common country names to ISO 3166-1 alpha-2 codes     for Ticketmaster API. (+5 more)

### Community 5 - "Community 5"
Cohesion: 0.22
Nodes (13): run_driving_agent(), analyse_route_conditions(), calculate_driving_score(), classify_terrain(), fetch_elevation(), Gets elevation at a specific coordinate.     Used to detect mountain/hill roads, Analyses driving conditions for each     waypoint along the route., Classifies terrain type based on elevation. (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (10): clear_prefix(), get_cache_stats(), Deletes all cache keys starting with prefix.     Returns number of keys deleted, Returns stats about current cache usage.     Useful for the /cache/stats debug, cache_clear_all(), cache_stats(), debug_search(), get_driving_conditions() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.48
Nodes (6): BaseModel, Activity, ChatRequest, ChatResponse, SessionStartResponse, UserProfile

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (2): get_history(), save_message()

### Community 9 - "Community 9"
Cohesion: 0.5
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
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Calls Gemma to get deep cuisine knowledge     about the destination.

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Tries web search first, falls back to      Gemma knowledge if search unavailabl

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Converts activity list to a clean text summary     for Gemma to reason over.

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Calculates usable activity hours in a day     minus meal breaks.

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Pure Python scoring — how well an activity fits     a given day. Higher = bette

## Knowledge Gaps
- **38 isolated node(s):** `Converts activity list to a clean text summary     for Gemma to reason over.`, `Calculates usable activity hours in a day     minus meal breaks.`, `Pure Python scoring — how well an activity fits     a given day. Higher = bette`, `Searches restaurants using Foursquare Places API.     budget_level: cheap | mod`, `Searches places using Geoapify Places API.     place_types:       catering.res` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 10`** (1 nodes): `orchestrator.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (1 nodes): `language_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `helpers.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `Chat.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `Sidebar.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `AgentHeader.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `AlertCard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `LoadingRadar.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `BudgetAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `CuisineAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `CultureAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `DashboardHome.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `DisruptionAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `DrivingAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `ItineraryAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `LanguageAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `Onboarding.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `WeatherAgent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `travelmind.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `useStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `Calls Gemma to get deep cuisine knowledge     about the destination.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `Tries web search first, falls back to      Gemma knowledge if search unavailabl`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `Converts activity list to a clean text summary     for Gemma to reason over.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Calculates usable activity hours in a day     minus meal breaks.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Pure Python scoring — how well an activity fits     a given day. Higher = bette`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_culture_agent()` connect `Community 4` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Why does `run_weather_agent()` connect `Community 2` to `Community 1`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Why does `run_cuisine_agent()` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Are the 29 inferred relationships involving `WeatherRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`WeatherRequest` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `ItineraryRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`ItineraryRequest` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `DisruptionRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`DisruptionRequest` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `DrivingRequest` (e.g. with `Test endpoint for the weather agent only.` and `Takes a list of planned activities and     optimizes them around the weather fo`) actually correct?**
  _`DrivingRequest` has 29 INFERRED edges - model-reasoned connections that need verification._