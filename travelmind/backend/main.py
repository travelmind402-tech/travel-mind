import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from models.schemas import WeatherRequest
from agents.weather_agent import run_weather_agent
from fastapi.openapi.docs import get_swagger_ui_html

load_dotenv()

app = FastAPI(title="TravelMind API — Weather Agent", docs_url=None, redoc_url=None)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.9.0/swagger-ui.css",
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