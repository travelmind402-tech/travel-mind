import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

r = redis.from_url(os.getenv("REDIS_URL"))

def save_user_profile(session_id: str, profile: dict):
    r.setex(
        f"profile:{session_id}",
        86400,
        json.dumps(profile)
    )

def get_user_profile(session_id: str) -> dict:
    data = r.get(f"profile:{session_id}")
    return json.loads(data) if data else None

def save_message(session_id: str, role: str, content: str):
    history = get_history(session_id)
    history.append({
        "role": role,
        "parts": [{"text": content}]
    })
    if len(history) > 20:
        history = history[-20:]
    r.setex(
        f"history:{session_id}",
        86400,
        json.dumps(history)
    )

def get_history(session_id: str) -> list:
    data = r.get(f"history:{session_id}")
    return json.loads(data) if data else []

def clear_session(session_id: str):
    r.delete(f"history:{session_id}")
    r.delete(f"profile:{session_id}")