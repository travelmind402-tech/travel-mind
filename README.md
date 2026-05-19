# TravelMind

TravelMind is an AI-powered travel assistant that helps people plan safer, smoother, and more informed trips. The app takes basic trip details such as destination, dates, group size, budget, food preferences, allergies, language needs, and transit stops, then uses specialized agents to return practical travel guidance.

The goal is to make trip preparation less scattered. Instead of checking weather, food options, local customs, travel risks, driving conditions, budget planning, and useful phrases in separate places, TravelMind brings those pieces together in one flow.

## Live App

The deployed app is available here:

https://node-js-api-server.onrender.com/

## What The App Does

TravelMind can help with:

- Creating a travel session for a destination and date range
- Weather and health-related travel guidance
- Budget planning based on travel style and daily budget
- Cuisine suggestions based on dietary preferences and allergies
- Local culture, customs, festivals, and etiquette
- Driving and route condition insights
- Disruption and safety awareness
- Useful language phrases for the trip

## Project Structure

The mobile frontend lives in:

```text
artifacts/travelmind-mobile
```

The Python backend with the main AI agent workflows lives in:

```text
backend
```

There is also a Node/Express API server here:

```text
artifacts/api-server
```

The mobile app sends requests to `/api/session/...`. The Node API server handles the public API layer and proxies session requests to the Python FastAPI backend.

## Tech Stack

- React Native and Expo for the mobile app
- React and Vite for the web frontend
- Node.js and Express for the API server
- Python and FastAPI for the AI travel backend
- SQLite for local trip/cache storage
- Agent-based backend modules for weather, budget, cuisine, culture, driving, disruption, and language support

## Running Locally

Install dependencies from the workspace root:

```bash
pnpm install
```

Run the Node API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Run the mobile app:

```bash
pnpm --filter @workspace/travelmind-mobile run dev
```

Run the Python backend from the `backend` folder with the required environment variables configured in `backend/.env`.

## Notes

Some backend features depend on external APIs and model providers, so local results may vary depending on which API keys are configured. The deployed version is the easiest way to try the app without setting up the full backend environment.
