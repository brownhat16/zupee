from fastapi import APIRouter
from pydantic import BaseModel

from services.cricket import play_cricket_round

router = APIRouter(prefix="/cricket", tags=["cricket"])


class CricketPredictionRequest(BaseModel):
    choice: str
    personality: str = "savage"


@router.post("/predict")
def predict(payload: CricketPredictionRequest) -> dict:
    return play_cricket_round(payload.choice, payload.personality)
