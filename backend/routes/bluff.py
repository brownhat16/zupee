from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.bluff import ask_bluff_question, guess_bluff_answer, start_bluff_game

router = APIRouter(prefix="/bluff", tags=["bluff"])


class BluffStartRequest(BaseModel):
    personality: str = "tricky"


class BluffAskRequest(BaseModel):
    session_id: str
    question: str = Field(..., min_length=1)
    personality: str = "tricky"


class BluffGuessRequest(BaseModel):
    session_id: str
    guess: int
    personality: str = "tricky"


@router.post("/start")
def start(payload: BluffStartRequest) -> dict:
    return start_bluff_game(payload.personality)


@router.post("/ask")
def ask(payload: BluffAskRequest) -> dict:
    return ask_bluff_question(payload.session_id, payload.question, payload.personality)


@router.post("/guess")
def guess(payload: BluffGuessRequest) -> dict:
    return guess_bluff_answer(payload.session_id, payload.guess, payload.personality)
