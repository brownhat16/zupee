import secrets

from services.storage import update_state

CRICKET_BUCKETS = [
    {"label": "<6", "runs": [0, 1, 2, 3, 4, 5], "weight": 35},
    {"label": "6-10", "runs": [6, 7, 8, 9, 10], "weight": 45},
    {"label": "10+", "runs": [11, 12, 13, 14, 15, 16, 17, 18], "weight": 20},
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
    total_weight = sum(item["weight"] for item in CRICKET_BUCKETS)
    roll = secrets.randbelow(total_weight)
    cumulative_weight = 0

    for bucket in CRICKET_BUCKETS:
        cumulative_weight += bucket["weight"]
        if roll < cumulative_weight:
            return bucket["label"], secrets.choice(bucket["runs"])

    fallback_bucket = CRICKET_BUCKETS[-1]
    return fallback_bucket["label"], secrets.choice(fallback_bucket["runs"])


def play_cricket_round(choice: str, personality: str) -> dict:
    actual_bucket, runs = _pick_outcome()
    win = choice == actual_bucket

    reaction_pool = CRICKET_REACTIONS["win" if win else "loss"]
    reaction = secrets.choice(reaction_pool)
    if personality == "chill" and not win:
        reaction = "Close tha. Next over mein comeback pakka."

    def mutate(state: dict) -> dict:
        state["games_played"] += 1
        if win:
            state["score"] += 10
            state["streak"] += 1
        else:
            state["score"] = max(0, state["score"] - 3)
            state["streak"] = 0

        return {
            "choice": choice,
            "actual_bucket": actual_bucket,
            "actual_runs": runs,
            "win": win,
            "reaction": reaction,
            "score": state["score"],
            "streak": state["streak"],
        }

    return update_state(mutate)
