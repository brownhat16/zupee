import secrets
import time

from services.llm import generate_game_commentary
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

PAYOUTS = {
    "<6": 10,   # moderate risk
    "6-10": 5,  # safest bucket
    "10+": 20,  # high risk, high reward
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


def play_cricket_round(choice: str, personality: str, chat_session_id: str | None = None) -> dict:
    start_ts = time.perf_counter()
    actual_bucket, runs = _pick_outcome()
    win = choice == actual_bucket

    reaction_pool = CRICKET_REACTIONS["win" if win else "loss"]
    reaction = secrets.choice(reaction_pool)
    if personality == "chill" and not win:
        reaction = "Close tha. Next over mein comeback pakka."

    def mutate(state: dict) -> dict:
        state["games_played"] += 1
        streak_before = state["streak"]
        streak_after = streak_before

        base_payout = PAYOUTS.get(choice, 10)
        multiplier = 1
        streak_save_offer = None

        if win:
            streak_after = streak_before + 1
            if streak_after >= 3:
                multiplier = 2
            score_delta = base_payout * multiplier
            state["score"] += score_delta
            state["streak"] = streak_after
        else:
            # offer streak preservation if player had a meaningful streak
            if streak_before >= 3:
                streak_save_offer = {
                    "available": True,
                    "cost_currency": 50,
                    "option": "watch_ad_or_pay",
                    "streak_before_loss": streak_before,
                }
            streak_after = 0
            state["score"] = max(0, state["score"] - 3)
            state["streak"] = streak_after
            score_delta = -3

        return {
            "choice": choice,
            "actual_bucket": actual_bucket,
            "actual_runs": runs,
            "win": win,
            "reaction": reaction,
            "score": state["score"],
            "streak": state["streak"],
            "score_delta": score_delta,
            "score_reason": "Correct bucket prediction" if win else "Incorrect bucket prediction",
            "payout_base": base_payout if win else 0,
            "payout_multiplier": multiplier if win else 0,
            "streak_before": streak_before,
            "streak_after": streak_after,
            "streak_save_offer": streak_save_offer,
        }

    result = update_state(mutate)
    result["latency_ms"] = round((time.perf_counter() - start_ts) * 1000, 2)

    # Simulated real-time match context for richer LLM copy
    match_context = {
        "venue": "Wankhede Stadium",
        "over": "18.2",
        "batting": "CSK",
        "bowling": "MI",
        "striker": "V. Kohli",
        "bowler": "J. Bumrah",
        "required_run_rate": "9.8",
        "risk_call": choice,
    }

    result["reaction"] = generate_game_commentary(
        event_type="cricket_round",
        personality=personality,
        context={
            "game": "cricket",
            "choice": choice,
            "actual_bucket": actual_bucket,
            "actual_runs": runs,
            "win": win,
            "score": result["score"],
            "streak": result["streak"],
            "payout_base": result["payout_base"],
            "payout_multiplier": result["payout_multiplier"],
            "latency_ms": result["latency_ms"],
            "match_context": match_context,
        },
        fallback_reply=reaction,
        session_id=chat_session_id,
        record_event=(
            f"Cricket round ended. Player chose {choice}. "
            f"Actual result was {runs} runs in bucket {actual_bucket}. Win: {win}."
        ),
        instruction="Generate a short in-app reaction to this finished cricket round.",
    )
    return result
