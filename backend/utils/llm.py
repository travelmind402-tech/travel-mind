import asyncio
from typing import Any

from google.genai import types

from utils.gemini_client import get_genai_client


SUPPORTED_GEMMA_MODELS = [
    "models/gemini-3-flash",
    "models/gemini-2.5-flash",
    "models/gemini-3.1-flash-lite",
]
RETRYABLE_MODEL_ERRORS = (
    "500",
    "503",
    "504",
    "INTERNAL",
    "UNAVAILABLE",
    "InternalServerError",
    "HTTP 500",
    "status_code=500",
    "status code: 500",
)



def is_retryable_model_error(error: str) -> bool:
    return any(marker in error for marker in RETRYABLE_MODEL_ERRORS)


async def generate_content_with_timeout(
    *,
    model: str,
    contents: Any,
    system_instruction: str | None = None,
    temperature: float = 0.2,
    max_output_tokens: int = 2048,
    timeout_seconds: int | None = 90,

    tools: list | None = None,
):
    config_kwargs = {
        "temperature": temperature,
        "max_output_tokens": max_output_tokens,
        "response_mime_type": "application/json",
    }
    if system_instruction is not None:
        config_kwargs["system_instruction"] = system_instruction
    if tools is not None:
        config_kwargs["tools"] = tools

    gen_call = asyncio.to_thread(
        get_genai_client().models.generate_content,
        model=model,
        contents=contents,
        config=types.GenerateContentConfig(**config_kwargs),
    )

    # If timeout_seconds is None, disable asyncio timeout wrapper.
    if timeout_seconds is None:
        return await gen_call

    return await asyncio.wait_for(gen_call, timeout=timeout_seconds)
