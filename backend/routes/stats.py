from fastapi import APIRouter

from services.storage import load_state

router = APIRouter(tags=["stats"])


@router.get("/stats")
def stats() -> dict:
    state = load_state()
    return {
        "score": state["score"],
        "streak": state["streak"],
        "games_played": state["games_played"],
    }
