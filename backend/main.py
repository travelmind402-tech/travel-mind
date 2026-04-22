import uuid
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models.schemas import WeatherRequest,ItineraryRequest,DisruptionRequest,DrivingRequest,CuisineRequest,CultureRequest
from agents.weather_agent import run_weather_agent
from fastapi.openapi.docs import get_swagger_ui_html
from agents.itinerary_resuffler_agent import run_itinerary_agent
from tools.weather_tool import fetch_daily_forecast_for_reshuffler, geocode_city
from agents.disruption_agent import run_disruption_agent
from agents.driving_agent import run_driving_agent
from agents.cuisine_agent import run_cuisine_agent
from agents.culture_agent import run_culture_agent


load_dotenv()

app = FastAPI(title="TravelMind API — Weather Agent", docs_url=None, redoc_url=None)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css",
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "TravelMind Weather Agent"
    }


@app.post("/weather")
async def get_weather(request: WeatherRequest):
    """
    Test endpoint for the weather agent only.
    """
    try:
        result = await run_weather_agent(
            city=request.city,
            country=request.country,
            travel_start_date=request.travel_start_date,
            travel_end_date=request.travel_end_date,
            traveler_type=request.traveler_type,
            family_members=request.family_members,
            known_allergies=request.known_allergies,  # <-- Just the allergies!
            transit_waypoints=request.transit_waypoints # <-- PASSING TOPIC 2
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.post("/itinerary/reshuffle")
async def reshuffle_itinerary(request: ItineraryRequest):
    """
    Takes a list of planned activities and
    optimizes them around the weather forecast.
    """
    try:
        # Convert Pydantic models to plain dicts
        activities_list = [
            {
                "name":           act.name,
                "type":           act.type,
                "preferred_date": act.preferred_date,
                "duration_hours": act.duration_hours,
                "notes":          act.notes,
            }
            for act in request.activities
        ]

        result = await run_itinerary_agent(
            city=request.city,
            country=request.country,
            travel_start_date=request.travel_start_date,
            travel_end_date=request.travel_end_date,
            traveler_type=request.traveler_type,
            activities=activities_list,
            daily_start_time=request.daily_start_time,
            daily_end_time=request.daily_end_time,
            avoid_extreme_heat=request.avoid_extreme_heat,
            avoid_rain_completely=request.avoid_rain_completely,
            daily_budget_usd=request.daily_budget_usd,           # ← added
            total_trip_budget_usd=request.total_trip_budget_usd,  # ← added
            currency=request.currency
        )
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.get("/debug/forecast")
async def debug_forecast():
    """
    Direct test of the forecast tool.
    Remove this endpoint after debugging.
    """
    # Test 1: geocode
    coords = await geocode_city("Shillong")
    print(f"[DEBUG] Coords: {coords}")
    
    # Test 2: forecast
    forecast = await fetch_daily_forecast_for_reshuffler(
        "Shillong",
        "2026-04-25",
        "2026-05-01"
    )
    print(f"[DEBUG] Forecast result: {forecast}")
    
    return {
        "coords": coords,
        "forecast": forecast
    }
    
@app.post("/disruptions/crowd-sourced")
async def get_crowd_disruptions(
    request: DisruptionRequest
):
    """
    Searches real traveler reports, Reddit posts and
    travel reviews to find crowd-sourced disruption
    patterns for a destination and month.
    """
    try:
        result = await run_disruption_agent(
            city=request.city,
            country=request.country,
            travel_month=request.travel_month,
            travel_year=request.travel_year,
            traveler_type=request.traveler_type
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.get("/debug/search-test")
async def debug_search():
    """
    Tests if Gemma web search tool is available
    on your API key.
    """
    try:
        from google import genai
        from google.genai import types

        test_client = genai.Client(
            api_key=os.getenv("GOOGLE_GENERATIVE_API_KEY")
        )

        response = test_client.models.generate_content(
            model="gemma-4-31b-it",
            contents="What is the weather in Shillong today?",
            config=types.GenerateContentConfig(
                tools=[{"google_search": {}}],
                temperature=0.1,
                max_output_tokens=256,
            )
        )
        return {
            "status": "web_search_available",
            "response": response.text[:200]
        }
    except Exception as e:
        return {
            "status": "web_search_unavailable",
            "error": str(e),
            "fallback": "will_use_gemma_knowledge_only"
        }
        
        
@app.post("/driving/conditions")
async def get_driving_conditions(
    request: DrivingRequest
):
    """
    Produces a day-by-day driving safety score
    and road condition advisory for the trip.
    """
    try:
        result = await run_driving_agent(
            city=request.city,
            country=request.country,
            travel_start_date=request.travel_start_date,
            travel_end_date=request.travel_end_date,
            traveler_type=request.traveler_type,
            route_waypoints=request.route_waypoints,
            vehicle_type=request.vehicle_type,
            driver_experience=request.driver_experience,
            night_driving=request.night_driving
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
@app.post("/cuisine/recommendations")
async def get_cuisine_recommendations(
    request: CuisineRequest
):
    """
    Returns a complete cuisine guide including
    must-try dishes, live restaurant listings,
    street food guide, food markets and budget
    meal plan — all in the user's local currency.
    """
    try:
        result = await run_cuisine_agent(
            city=request.city,
            country=request.country,
            travel_start_date=request.travel_start_date,
            travel_end_date=request.travel_end_date,
            traveler_type=request.traveler_type,
            daily_budget_usd=request.daily_budget_usd,
            currency=request.currency,
            dietary_restrictions=request.dietary_restrictions,
            cuisine_preferences=request.cuisine_preferences,
            group_size=request.group_size
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
        
@app.post("/culture/guide")
async def get_culture_guide(
    request: CultureRequest
):
    """
    Returns a complete cultural intelligence briefing including
    customs, dress code, language phrases, live festivals,
    local laws, and traveler-type-specific etiquette tips.
    """
    try:
        result = await run_culture_agent(
            city=request.city,
            country=request.country,
            travel_start_date=request.travel_start_date,
            travel_end_date=request.travel_end_date,
            traveler_type=request.traveler_type,
            travel_style=request.travel_style,
            group_size=request.group_size,
            known_sensitivities=request.known_sensitivities
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )