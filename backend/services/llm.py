import os
import logging

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def _build_client() -> OpenAI | None:
    api_key = (
        os.getenv("NVIDIA_API_KEY")
        or os.getenv("OPENAI_API_KEY")
        or os.getenv("TOGETHER_API_KEY")
    )
    if not api_key:
        return None

    base_url = os.getenv("OPENAI_BASE_URL")
    if not base_url and os.getenv("NVIDIA_API_KEY"):
        base_url = "https://integrate.api.nvidia.com/v1"
    if not base_url and os.getenv("TOGETHER_API_KEY"):
        base_url = "https://api.together.xyz/v1"

    return OpenAI(api_key=api_key, base_url=base_url)


def _fallback_reply(message: str, personality: str) -> str:
    vibe = "Savage" if personality == "savage" else "Chill"
    return (
        f"{vibe} mode active. Tu bola: '{message}'. "
        "Main online LLM ke bina bhi vibe maintain kar raha hoon, so chal agla move kar."
    )


def generate_chat_reply(message: str, personality: str = "savage") -> str:
    client = _build_client()
    if client is None:
        logger.warning("LLM fallback used: no provider API key configured")
        return _fallback_reply(message, personality)

    model = (
        os.getenv("NVIDIA_MODEL")
        or os.getenv("OPENAI_MODEL")
        or os.getenv("TOGETHER_MODEL")
        or "gpt-4o-mini"
    )
    system_prompt = (
        "You are GameBuddy AI, a fun entertainment companion for a mobile game app. "
        "Reply briefly, in playful Hinglish, with Gen-Z energy. "
        "If personality is savage, be lightly savage. If chill, be encouraging."
    )

    try:
        logger.info("Attempting LLM chat completion with model=%s base_url=%s", model, os.getenv("OPENAI_BASE_URL"))
        completion = client.chat.completions.create(
            model=model,
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.8")),
            top_p=float(os.getenv("LLM_TOP_P", "0.7")),
            max_tokens=int(os.getenv("LLM_MAX_TOKENS", "256")),
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"{system_prompt}\n\n"
                        f"Personality: {personality}\n"
                        f"User message: {message}"
                    ),
                },
            ],
        )
        reply = completion.choices[0].message.content
        if not reply:
            logger.warning("LLM returned empty content, using fallback reply")
            return _fallback_reply(message, personality)
        logger.info("LLM chat completion succeeded with model=%s", model)
        return reply
    except Exception as error:
        logger.exception("LLM chat completion failed: %s", error)
        return _fallback_reply(message, personality)
