from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from services.cricket import play_cricket_round

router = APIRouter(prefix="/cricket", tags=["cricket"])


class CricketPredictionRequest(BaseModel):
    choice: Literal["<6", "6-10", "10+"]
    personality: Literal["savage", "chill"] = "savage"
    chat_session_id: str | None = None


@router.post("/predict")
def predict(payload: CricketPredictionRequest) -> dict:
    return play_cricket_round(payload.choice, payload.personality, payload.chat_session_id)
