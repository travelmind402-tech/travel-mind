# Graph Report - .  (2026-04-21)

## Corpus Check
- Corpus is ~3,142 words - fits in a single context window. You may not need a graph.

## Summary
- 67 nodes · 56 edges · 35 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.79)
- Token cost: 100 input · 200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_schemaspy|schemaspy]]
- [[_COMMUNITY_redismemorypy|redismemorypy]]
- [[_COMMUNITY_mainpy|mainpy]]
- [[_COMMUNITY_userprofilepy|userprofilepy]]
- [[_COMMUNITY_weathertoolpy|weathertoolpy]]
- [[_COMMUNITY_fetchrouteforecast|fetchrouteforecast]]
- [[_COMMUNITY_runweatheragent|runweatheragent]]
- [[_COMMUNITY_Biological model for mosquito|Biological model for mosquito ]]
- [[_COMMUNITY_fetchrealtimefires|fetchrealtimefires]]
- [[_COMMUNITY_Fetches samemonth precipitatio|Fetches samemonth precipitatio]]
- [[_COMMUNITY_Scans the USGS database for Ma|Scans the USGS database for Ma]]
- [[_COMMUNITY_fetchhealthoutbreaks|fetchhealthoutbreaks]]
- [[_COMMUNITY_Uvicorn|Uvicorn]]
- [[_COMMUNITY_aiohttp|aiohttp]]
- [[_COMMUNITY_runextractpy|runextractpy]]
- [[_COMMUNITY_orchestratorpy|orchestratorpy]]
- [[_COMMUNITY_budgetagentpy|budgetagentpy]]
- [[_COMMUNITY_cuisineagentpy|cuisineagentpy]]
- [[_COMMUNITY_cultureagentpy|cultureagentpy]]
- [[_COMMUNITY_languageagentpy|languageagentpy]]
- [[_COMMUNITY_initpy|initpy]]
- [[_COMMUNITY_initpy|initpy]]
- [[_COMMUNITY_initpy|initpy]]
- [[_COMMUNITY_initpy|initpy]]
- [[_COMMUNITY_helperspy|helperspy]]
- [[_COMMUNITY_initpy|initpy]]
- [[_COMMUNITY_Appjsx|Appjsx]]
- [[_COMMUNITY_mainjsx|mainjsx]]
- [[_COMMUNITY_travelmindjs|travelmindjs]]
- [[_COMMUNITY_Chatjsx|Chatjsx]]
- [[_COMMUNITY_Onboardingjsx|Onboardingjsx]]
- [[_COMMUNITY_useStorejs|useStorejs]]
- [[_COMMUNITY_Google GenAI|Google GenAI]]
- [[_COMMUNITY_pythondotenv|pythondotenv]]
- [[_COMMUNITY_geopy|geopy]]

## God Nodes (most connected - your core abstractions)
1. `run_weather_agent()` - 12 edges
2. `fetch_route_forecast()` - 4 edges
3. `get_weather()` - 3 edges
4. `WeatherRequest` - 3 edges
5. `call_openweathermap()` - 3 edges
6. `fetch_historical_precipitation()` - 3 edges
7. `calculate_mosquito_risk()` - 3 edges
8. `fetch_historical_seismic_data()` - 3 edges
9. `fetch_realtime_fires()` - 3 edges
10. `Test endpoint for the weather agent only.` - 2 edges

## Surprising Connections (you probably didn't know these)
- `run_weather_agent()` --calls--> `fetch_reliefweb_disasters()`  [INFERRED]
  backend\agents\weather_agent.py → backend\tools\weather_tool.py
- `run_weather_agent()` --calls--> `fetch_ncei_station_data()`  [INFERRED]
  backend\agents\weather_agent.py → backend\tools\weather_tool.py
- `run_weather_agent()` --calls--> `fetch_health_and_pollen_data()`  [INFERRED]
  backend\agents\weather_agent.py → backend\tools\weather_tool.py
- `get_weather()` --calls--> `run_weather_agent()`  [INFERRED]
  backend\main.py → backend\agents\weather_agent.py
- `Test endpoint for the weather agent only.` --uses--> `WeatherRequest`  [INFERRED]
  backend\main.py → backend\models\schemas.py

## Hyperedges (group relationships)
- **Backend Python Dependencies** — req_fastapi, req_google_genai, req_uvicorn, req_python_dotenv, req_httpx, req_geopy, req_aiohttp [EXTRACTED 1.00]

## Communities

### Community 0 - "schemaspy"
Cohesion: 0.48
Nodes (6): BaseModel, ChatRequest, ChatResponse, SessionStartResponse, UserProfile, WeatherRequest

### Community 1 - "redismemorypy"
Cohesion: 0.4
Nodes (2): get_history(), save_message()

### Community 2 - "mainpy"
Cohesion: 0.4
Nodes (2): get_weather(), Test endpoint for the weather agent only.

### Community 3 - "userprofilepy"
Cohesion: 0.5
Nodes (0): 

### Community 4 - "weathertoolpy"
Cohesion: 0.5
Nodes (3): fetch_health_and_pollen_data(), fetch_ncei_station_data(), fetch_reliefweb_disasters()

### Community 5 - "fetchrouteforecast"
Cohesion: 0.67
Nodes (3): call_openweathermap(), fetch_route_forecast(), Fetches a simple forecast for multiple cities in parallel.     Used for the Jou

### Community 6 - "runweatheragent"
Cohesion: 0.67
Nodes (2): run_weather_agent(), geocode_city()

### Community 7 - "Biological model for mosquito "
Cohesion: 1.0
Nodes (2): calculate_mosquito_risk(), Biological model for mosquito activity thresholds.

### Community 8 - "fetchrealtimefires"
Cohesion: 1.0
Nodes (2): fetch_realtime_fires(), Uses NASA VIIRS satellites to detect thermal anomalies (fires) in a 1-degree box

### Community 9 - "Fetches samemonth precipitatio"
Cohesion: 1.0
Nodes (2): fetch_historical_precipitation(), Fetches same-month precipitation data for the     past 20 years from Open-Meteo

### Community 10 - "Scans the USGS database for Ma"
Cohesion: 1.0
Nodes (2): fetch_historical_seismic_data(), Scans the USGS database for Magnitude 4.5+ events within 100km over the last 20

### Community 11 - "fetchhealthoutbreaks"
Cohesion: 1.0
Nodes (2): fetch_health_outbreaks(), Specifically hunts for active epidemics and health crises using ReliefWeb v2.

### Community 12 - "Uvicorn"
Cohesion: 1.0
Nodes (2): FastAPI, Uvicorn

### Community 13 - "aiohttp"
Cohesion: 1.0
Nodes (2): aiohttp, HTTPX

### Community 14 - "runextractpy"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "orchestratorpy"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "budgetagentpy"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "cuisineagentpy"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "cultureagentpy"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "languageagentpy"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "initpy"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "initpy"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "initpy"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "initpy"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "helperspy"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "initpy"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Appjsx"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "mainjsx"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "travelmindjs"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Chatjsx"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Onboardingjsx"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "useStorejs"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Google GenAI"
Cohesion: 1.0
Nodes (1): Google GenAI

### Community 33 - "pythondotenv"
Cohesion: 1.0
Nodes (1): python-dotenv

### Community 34 - "geopy"
Cohesion: 1.0
Nodes (1): geopy

## Knowledge Gaps
- **13 isolated node(s):** `Fetches same-month precipitation data for the     past 20 years from Open-Meteo`, `Fetches a simple forecast for multiple cities in parallel.     Used for the Jou`, `Biological model for mosquito activity thresholds.`, `Specifically hunts for active epidemics and health crises using ReliefWeb v2.`, `Scans the USGS database for Magnitude 4.5+ events within 100km over the last 20` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Biological model for mosquito `** (2 nodes): `calculate_mosquito_risk()`, `Biological model for mosquito activity thresholds.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `fetchrealtimefires`** (2 nodes): `fetch_realtime_fires()`, `Uses NASA VIIRS satellites to detect thermal anomalies (fires) in a 1-degree box`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Fetches samemonth precipitatio`** (2 nodes): `fetch_historical_precipitation()`, `Fetches same-month precipitation data for the     past 20 years from Open-Meteo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scans the USGS database for Ma`** (2 nodes): `fetch_historical_seismic_data()`, `Scans the USGS database for Magnitude 4.5+ events within 100km over the last 20`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `fetchhealthoutbreaks`** (2 nodes): `fetch_health_outbreaks()`, `Specifically hunts for active epidemics and health crises using ReliefWeb v2.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Uvicorn`** (2 nodes): `FastAPI`, `Uvicorn`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `aiohttp`** (2 nodes): `aiohttp`, `HTTPX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `runextractpy`** (1 nodes): `run_extract.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `orchestratorpy`** (1 nodes): `orchestrator.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `budgetagentpy`** (1 nodes): `budget_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `cuisineagentpy`** (1 nodes): `cuisine_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `cultureagentpy`** (1 nodes): `culture_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `languageagentpy`** (1 nodes): `language_agent.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `initpy`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `initpy`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `initpy`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `initpy`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `helperspy`** (1 nodes): `helpers.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `initpy`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Appjsx`** (1 nodes): `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `mainjsx`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `travelmindjs`** (1 nodes): `travelmind.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chatjsx`** (1 nodes): `Chat.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Onboardingjsx`** (1 nodes): `Onboarding.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `useStorejs`** (1 nodes): `useStore.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Google GenAI`** (1 nodes): `Google GenAI`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `pythondotenv`** (1 nodes): `python-dotenv`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `geopy`** (1 nodes): `geopy`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `run_weather_agent()` connect `runweatheragent` to `mainpy`, `weathertoolpy`, `fetchrouteforecast`, `Biological model for mosquito `, `fetchrealtimefires`, `Fetches samemonth precipitatio`, `Scans the USGS database for Ma`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
- **Why does `get_weather()` connect `mainpy` to `runweatheragent`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `Test endpoint for the weather agent only.` connect `mainpy` to `schemaspy`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `run_weather_agent()` (e.g. with `get_weather()` and `geocode_city()`) actually correct?**
  _`run_weather_agent()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Fetches same-month precipitation data for the     past 20 years from Open-Meteo`, `Fetches a simple forecast for multiple cities in parallel.     Used for the Jou`, `Biological model for mosquito activity thresholds.` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._