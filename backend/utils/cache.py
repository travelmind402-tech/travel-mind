import redis
import json
import os
import hashlib
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

# ─────────────────────────────────────────────
# Redis connection
# ─────────────────────────────────────────────
r = redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379"),
    ssl_cert_reqs=None,
    decode_responses=False
)

# ─────────────────────────────────────────────
# TTL constants (in seconds)
# ─────────────────────────────────────────────
TTL = {
    "weather":       10800,   # 3 hours
    "historical":    2592000, # 30 days
    "disaster":      604800,  # 7 days
    "cuisine":       21600,   # 6 hours
    "culture":       2592000, # 30 days
    "disruption":    86400,   # 24 hours
    "driving":       10800,   # 3 hours
    "budget":        86400,   # 24 hours
    "exchange_rate": 3600,    # 1 hour
    "restaurants":   21600,   # 6 hours
    "itinerary":     10800,   # 3 hours
}


# ─────────────────────────────────────────────
# Key builder
# ─────────────────────────────────────────────
def build_cache_key(prefix: str, **kwargs) -> str:
    """
    Builds a consistent cache key from prefix
    and keyword arguments.

    Example:
      build_cache_key("weather", city="Shillong",
                      date="2026-04-25")
      → "weather:city=shillong:date=2026-04-25"
    """
    parts = [prefix]
    for k, v in sorted(kwargs.items()):
        if v is not None:
            # Normalize to lowercase, strip spaces
            val = str(v).lower().strip()
            parts.append(f"{k}={val}")

    key = ":".join(parts)

    # If key is too long hash it
    if len(key) > 200:
        hashed = hashlib.md5(key.encode()).hexdigest()
        key = f"{prefix}:hash:{hashed}"

    return key


# ─────────────────────────────────────────────
# Core cache functions
# ─────────────────────────────────────────────
async def get_cache(key: str) -> dict | None:
    """
    Retrieves cached value by key.
    Returns None if not found or expired.
    """
    try:
        data = r.get(key)
        if data:
            print(f"[Cache] HIT  → {key}")
            return json.loads(data)
        print(f"[Cache] MISS → {key}")
        return None
    except Exception as e:
        print(f"[Cache] GET error: {e}")
        return None


async def set_cache(
    key: str,
    value: dict,
    ttl: int
) -> bool:
    """
    Stores value in cache with TTL in seconds.
    Returns True if successful.
    """
    try:
        payload = json.dumps(value, default=str)
        r.setex(key, ttl, payload)
        print(f"[Cache] SET  → {key} "
              f"(expires in {ttl//3600}h "
              f"{(ttl%3600)//60}m)")
        return True
    except Exception as e:
        print(f"[Cache] SET error: {e}")
        return False


async def delete_cache(key: str) -> bool:
    """
    Deletes a specific cache entry.
    """
    try:
        r.delete(key)
        print(f"[Cache] DEL  → {key}")
        return True
    except Exception as e:
        print(f"[Cache] DEL error: {e}")
        return False


async def clear_prefix(prefix: str) -> int:
    """
    Deletes all cache keys starting with prefix.
    Returns number of keys deleted.
    """
    try:
        keys = r.keys(f"{prefix}:*")
        if keys:
            r.delete(*keys)
        print(f"[Cache] CLEAR → {prefix}:* "
              f"({len(keys)} keys deleted)")
        return len(keys)
    except Exception as e:
        print(f"[Cache] CLEAR error: {e}")
        return 0


# ─────────────────────────────────────────────
# Main helper — cache or fetch
# ─────────────────────────────────────────────
async def cache_or_fetch(
    key: str,
    ttl: int,
    fetch_func,
    *args,
    **kwargs
) -> dict:
    """
    Checks cache first. If hit returns cached data.
    If miss calls fetch_func, caches result, returns it.

    Usage:
      result = await cache_or_fetch(
          key   = "weather:city=shillong:date=2026-04-25",
          ttl   = TTL["weather"],
          fetch_func = run_weather_agent,
          city  = "Shillong",
          country = "India",
          ...
      )
    """
    # Check cache first
    cached = await get_cache(key)
    if cached is not None:
        cached["_from_cache"] = True
        cached["_cache_key"]  = key
        return cached

    # Cache miss — fetch fresh data
    result = await fetch_func(*args, **kwargs)

    # Only cache successful responses
    if result and "error" not in result:
        result["_cached_at"] = datetime.now().isoformat()
        await set_cache(key, result, ttl)
    else:
        print(f"[Cache] SKIP SET → error in result, "
              f"not caching")

    return result


# ─────────────────────────────────────────────
# Cache status checker
# ─────────────────────────────────────────────
async def get_cache_stats() -> dict:
    """
    Returns stats about current cache usage.
    Useful for the /cache/stats debug endpoint.
    """
    try:
        info    = r.info()
        all_keys = r.keys("*")

        # Group keys by prefix
        prefix_counts = {}
        for key in all_keys:
            key_str = key.decode() if isinstance(
                key, bytes) else key
            prefix  = key_str.split(":")[0]
            prefix_counts[prefix] = (
                prefix_counts.get(prefix, 0) + 1
            )

        return {
            "total_keys":        len(all_keys),
            "memory_used":       info.get(
                "used_memory_human", "unknown"),
            "connected_clients": info.get(
                "connected_clients", 0),
            "keys_by_prefix":    prefix_counts,
            "redis_version":     info.get(
                "redis_version", "unknown"),
            "uptime_hours":      round(
                info.get("uptime_in_seconds", 0)
                / 3600, 1
            )
        }
    except Exception as e:
        return {"error": str(e)}