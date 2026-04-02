import json
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
STATE_FILE = DATA_DIR / "state.json"

DEFAULT_STATE: dict[str, Any] = {
    "score": 0,
    "streak": 0,
    "games_played": 0,
    "bluff_sessions": {},
}


def ensure_state_file() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        STATE_FILE.write_text(json.dumps(DEFAULT_STATE, indent=2), encoding="utf-8")


def load_state() -> dict[str, Any]:
    ensure_state_file()
    with STATE_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    merged = DEFAULT_STATE.copy()
    merged.update(data)
    if "bluff_sessions" not in merged:
        merged["bluff_sessions"] = {}
    return merged


def save_state(state: dict[str, Any]) -> None:
    ensure_state_file()
    with STATE_FILE.open("w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)
