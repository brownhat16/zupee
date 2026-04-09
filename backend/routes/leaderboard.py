from fastapi import APIRouter

from services.storage import load_state

router = APIRouter(tags=["leaderboard"])

MOCK_PLAYERS = [
    {"name": "Aarav", "score": 86, "streak": 5, "games_played": 31},
    {"name": "Zoya", "score": 74, "streak": 3, "games_played": 28},
    {"name": "Kabir", "score": 64, "streak": 2, "games_played": 24},
    {"name": "Maya", "score": 58, "streak": 4, "games_played": 22},
    {"name": "Ishaan", "score": 54, "streak": 1, "games_played": 19},
    {"name": "Rhea", "score": 49, "streak": 2, "games_played": 17},
    {"name": "Advait", "score": 45, "streak": 3, "games_played": 16},
    {"name": "Tara", "score": 41, "streak": 1, "games_played": 15},
    {"name": "Vihaan", "score": 36, "streak": 2, "games_played": 14},
    {"name": "Naina", "score": 32, "streak": 1, "games_played": 12},
]


def _build_leaderboard() -> list[dict]:
    state = load_state()
    user_entry = {
        "name": "You",
        "score": state.get("score", 0),
        "streak": state.get("streak", 0),
        "games_played": state.get("games_played", 0),
        "is_user": True,
    }

    combined = [*MOCK_PLAYERS, user_entry]
    combined.sort(key=lambda item: item.get("score", 0), reverse=True)

    for index, entry in enumerate(combined, start=1):
        entry["rank"] = index

    # Always surface the user in the top 10, keeping their actual rank number for context.
    top_ten = combined[:10]
    if user_entry not in top_ten:
        top_ten[-1] = user_entry

    return top_ten


@router.get("/leaderboard")
def leaderboard() -> dict:
    entries = _build_leaderboard()
    return {
        "entries": entries,
        "summary": {
            "headline": "Global Top 10",
            "note": "Mocked field of play plus your live stats so you always see where you stand.",
        },
    }
