import json
from pathlib import Path
from threading import RLock
from typing import Any
from typing import Callable, TypeVar

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
STATE_FILE = DATA_DIR / "state.json"
STATE_LOCK = RLock()
StateResult = TypeVar("StateResult")

DEFAULT_STATE: dict[str, Any] = {
    "score": 0,
    "streak": 0,
    "games_played": 0,
    "bluff_sessions": {},
}


def _clone_default_state() -> dict[str, Any]:
    return {
        "score": DEFAULT_STATE["score"],
        "streak": DEFAULT_STATE["streak"],
        "games_played": DEFAULT_STATE["games_played"],
        "bluff_sessions": {},
    }


def _ensure_state_file_unlocked() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        STATE_FILE.write_text(json.dumps(DEFAULT_STATE, indent=2), encoding="utf-8")


def ensure_state_file() -> None:
    with STATE_LOCK:
        _ensure_state_file_unlocked()


def _load_state_unlocked() -> dict[str, Any]:
    _ensure_state_file_unlocked()
    with STATE_FILE.open("r", encoding="utf-8") as file:
        data = json.load(file)

    merged = _clone_default_state()
    merged.update(data)
    if "bluff_sessions" not in merged:
        merged["bluff_sessions"] = {}
    return merged


def load_state() -> dict[str, Any]:
    with STATE_LOCK:
        return _load_state_unlocked()


def _save_state_unlocked(state: dict[str, Any]) -> None:
    _ensure_state_file_unlocked()
    with STATE_FILE.open("w", encoding="utf-8") as file:
        json.dump(state, file, indent=2)


def save_state(state: dict[str, Any]) -> None:
    with STATE_LOCK:
        _save_state_unlocked(state)


def update_state(mutator: Callable[[dict[str, Any]], StateResult]) -> StateResult:
    with STATE_LOCK:
        state = _load_state_unlocked()
        result = mutator(state)
        _save_state_unlocked(state)
        return result
