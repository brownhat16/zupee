from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.llm import generate_chat_reply

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    personality: str = Field(default="savage")


@router.post("/chat")
def chat(payload: ChatRequest) -> dict:
    response = generate_chat_reply(payload.message, payload.personality)
    return {"reply": response}
