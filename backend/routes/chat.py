from typing import Any
from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.llm import generate_chat_reply

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    personality: Literal["savage", "chill"] = "savage"
    session_id: str | None = None
    context: dict[str, Any] | None = None


@router.post("/chat")
def chat(payload: ChatRequest) -> dict:
    return generate_chat_reply(
        payload.message,
        payload.personality,
        session_id=payload.session_id,
        context=payload.context,
    )
