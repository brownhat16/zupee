import random

from services.storage import load_state, save_state

CRICKET_BUCKETS = [
    {"label": "<6", "runs": [0, 1, 2, 3, 4, 5], "weight": 0.35},
    {"label": "6-10", "runs": [6, 7, 8, 9, 10], "weight": 0.45},
    {"label": "10+", "runs": [11, 12, 13, 14, 15, 16, 17, 18], "weight": 0.20},
]

CRICKET_REACTIONS = {
    "win": [
        "Aaj toh analyst ban gaya tu 😎",
        "Bhai timing sahi tha. Full toss pe six maara tune.",
        "Prediction solid tha. Commentator bhi impress ho gaya.",
    ],
    "loss": [
        "Bhai ye kya guess tha 😂",
        "Is over pe tera data pack weak pad gaya.",
        "AI bhi confuse nahi tha, bas tu tha.",
    ],
}


def _pick_outcome() -> tuple[str, int]:
    picked = random.choices(CRICKET_BUCKETS, weights=[item["weight"] for item in CRICKET_BUCKETS], k=1)[0]
    return picked["label"], random.choice(picked["runs"])


def play_cricket_round(choice: str, personality: str) -> dict:
    actual_bucket, runs = _pick_outcome()
    win = choice == actual_bucket

    state = load_state()
    state["games_played"] += 1
    if win:
        state["score"] += 10
        state["streak"] += 1
    else:
        state["score"] = max(0, state["score"] - 3)
        state["streak"] = 0
    save_state(state)

    reaction_pool = CRICKET_REACTIONS["win" if win else "loss"]
    reaction = random.choice(reaction_pool)
    if personality == "chill" and not win:
        reaction = "Close tha. Next over mein comeback pakka."

    return {
        "choice": choice,
        "actual_bucket": actual_bucket,
        "actual_runs": runs,
        "win": win,
        "reaction": reaction,
        "score": state["score"],
        "streak": state["streak"],
    }
