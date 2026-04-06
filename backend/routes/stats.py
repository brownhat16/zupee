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
        "scope": "shared_service_instance",
        "scope_label": "Shared deployment stats",
        "scope_description": "These stats are shared by everyone using this deployed API instance.",
        "reset_behavior": "They reset only if the backend state file is cleared or deployment storage changes.",
    }
