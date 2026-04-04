import json
import os
from pathlib import Path
from threading import RLock
from typing import Any
from typing import Callable, TypeVar

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATA_DIR = BASE_DIR / "data"
DEFAULT_STATE_FILE = DEFAULT_DATA_DIR / "state.json"
STATE_LOCK = RLock()
StateResult = TypeVar("StateResult")

DEFAULT_STATE: dict[str, Any] = {
    "score": 0,
    "streak": 0,
    "games_played": 0,
    "bluff_sessions": {},
    "chat_sessions": {},
}


def _state_file_path() -> Path:
    configured_path = os.getenv("GAMEBUDDY_STATE_FILE")
    if configured_path:
        return Path(configured_path)
    return DEFAULT_STATE_FILE


def _clone_default_state() -> dict[str, Any]:
    return {
        "score": DEFAULT_STATE["score"],
        "streak": DEFAULT_STATE["streak"],
        "games_played": DEFAULT_STATE["games_played"],
        "bluff_sessions": {},
        "chat_sessions": {},
    }


def _ensure_state_file_unlocked() -> None:
    state_file = _state_file_path()
    state_file.parent.mkdir(parents=True, exist_ok=True)
    if not state_file.exists():
        state_file.write_text(json.dumps(DEFAULT_STATE, indent=2), encoding="utf-8")


def ensure_state_file() -> None:
    with STATE_LOCK:
        _ensure_state_file_unlocked()


def _load_state_unlocked() -> dict[str, Any]:
    state_file = _state_file_path()
    _ensure_state_file_unlocked()
    with state_file.open("r", encoding="utf-8") as file:
        data = json.load(file)

    merged = _clone_default_state()
    merged.update(data)
    if "bluff_sessions" not in merged:
        merged["bluff_sessions"] = {}
    if "chat_sessions" not in merged:
        merged["chat_sessions"] = {}
    return merged


def load_state() -> dict[str, Any]:
    with STATE_LOCK:
        return _load_state_unlocked()


def _save_state_unlocked(state: dict[str, Any]) -> None:
    state_file = _state_file_path()
    _ensure_state_file_unlocked()
    with state_file.open("w", encoding="utf-8") as file:
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
