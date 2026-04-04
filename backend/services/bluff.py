import re
import secrets
import uuid

from fastapi import HTTPException

from services.llm import generate_game_commentary
from services.storage import update_state

NUMBER_WORDS = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
    "thirty": 30,
    "forty": 40,
    "fifty": 50,
}

COMPARISON_PATTERNS = {
    "greater": ["greater than", "bigger than", "more than", "above", "over"],
    "less": ["less than", "smaller than", "lower than", "below", "under"],
}


def _normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s-]", " ", text.lower())).strip()


def _parse_word_number(tokens: list[str], start_index: int) -> tuple[int | None, int]:
    if start_index >= len(tokens):
        return None, 0

    current = tokens[start_index]
    if current in NUMBER_WORDS and NUMBER_WORDS[current] < 20:
        return NUMBER_WORDS[current], 1

    if current in {"twenty", "thirty", "forty", "fifty"}:
        if start_index + 1 < len(tokens) and tokens[start_index + 1] in NUMBER_WORDS and NUMBER_WORDS[tokens[start_index + 1]] < 10:
            return NUMBER_WORDS[current] + NUMBER_WORDS[tokens[start_index + 1]], 2
        return NUMBER_WORDS[current], 1

    return None, 0


def _extract_first_number(text: str) -> int | None:
    normalized = _normalize_text(text)
    digit_match = re.search(r"\b\d+\b", normalized)
    if digit_match:
        return int(digit_match.group())

    tokens = normalized.replace("-", " ").split()
    for index in range(len(tokens)):
        value, consumed = _parse_word_number(tokens, index)
        if consumed:
            return value

    return None


def _extract_number_after_phrase(question: str, phrases: list[str]) -> int | None:
    normalized = _normalize_text(question)
    for phrase in phrases:
        if phrase in normalized:
            trailing_text = normalized.split(phrase, 1)[1]
            return _extract_first_number(trailing_text)
    return None


def _is_prime(value: int) -> bool:
    if value < 2:
        return False
    for number in range(2, int(value ** 0.5) + 1):
        if value % number == 0:
            return False
    return True


def _truthful_reply(target: int, question: str) -> str:
    normalized_question = _normalize_text(question)

    if "even" in normalized_question:
        return "Haan" if target % 2 == 0 else "Nahi"

    if "odd" in normalized_question:
        return "Haan" if target % 2 == 1 else "Nahi"

    greater_than_threshold = _extract_number_after_phrase(question, COMPARISON_PATTERNS["greater"])
    if greater_than_threshold is not None:
        return "Haan" if target > greater_than_threshold else "Nahi"

    less_than_threshold = _extract_number_after_phrase(question, COMPARISON_PATTERNS["less"])
    if less_than_threshold is not None:
        return "Haan" if target < less_than_threshold else "Nahi"

    if "divisible by" in normalized_question or "multiple of" in normalized_question:
        divisor = _extract_first_number(question)
        if divisor:
            return "Haan" if target % divisor == 0 else "Nahi"
        return "Divisor clear bol, phir main seedha answer dunga."

    if "prime" in normalized_question:
        return "Haan" if _is_prime(target) else "Nahi"

    if normalized_question.startswith("is it"):
        guessed_number = _extract_first_number(question)
        if guessed_number is not None:
            return "Haan" if target == guessed_number else "Nahi"

    lower_bound = max(1, target - 5)
    upper_bound = min(50, target + 5)
    return f"Clue time: ye number {lower_bound} aur {upper_bound} ke beech chill kar raha hai."


def _style_reply(answer: str, lied: bool, personality: str) -> str:
    prefix = "Bluff alert: " if lied else "Seedha clue: "
    if personality == "chill":
        prefix = "Soft clue: " if not lied else "Thoda sa confusion: "
    return prefix + answer


def _get_session(state: dict, session_id: str) -> dict:
    session = state["bluff_sessions"].get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Bluff session not found")
    return session


def start_bluff_game(personality: str, chat_session_id: str | None = None) -> dict:
    intro = (
        "Maine 1 se 50 ke beech ek number lock kiya hai. 5 sawaal poochh le, par yaad rakh main kabhi kabhi bluff bhi karta hoon."
    )

    def mutate(state: dict) -> dict:
        session_id = str(uuid.uuid4())
        state["bluff_sessions"][session_id] = {
            "target": secrets.randbelow(50) + 1,
            "questions_left": 5,
            "lies_used": 0,
            "personality": personality,
        }
        return {"session_id": session_id, "intro": intro, "questions_left": 5}

    result = update_state(mutate)
    result["intro"] = generate_game_commentary(
        event_type="bluff_start",
        personality=personality,
        context={
            "game": "bluff",
            "stage": "start",
            "questions_left": result["questions_left"],
        },
        fallback_reply=intro,
        session_id=chat_session_id,
        record_event="Bluff Master session started with 5 questions available.",
        instruction="Generate a short Bluff Master intro for the player.",
    )
    return result


def ask_bluff_question(
    session_id: str,
    question: str,
    personality: str,
    chat_session_id: str | None = None,
) -> dict:
    def mutate(state: dict) -> dict:
        session = _get_session(state, session_id)
        if session["questions_left"] <= 0:
            raise HTTPException(status_code=400, detail="No questions left. Make a guess.")

        truthful_answer = _truthful_reply(session["target"], question)
        should_lie = secrets.randbelow(100) < 35
        answer = truthful_answer

        if should_lie:
            yes_no_map = {"Haan": "Nahi", "Nahi": "Haan"}
            answer = yes_no_map.get(truthful_answer, "Main itna seedha clue kyun doon?")
            session["lies_used"] += 1

        session["questions_left"] -= 1
        state["bluff_sessions"][session_id] = session
        base_answer = _style_reply(answer, should_lie, personality)

        return {
            "answer": base_answer,
            "base_answer": base_answer,
            "lied": should_lie,
            "questions_left": session["questions_left"],
        }

    result = update_state(mutate)
    follow_up = generate_game_commentary(
        event_type="bluff_question",
        personality=personality,
        context={
            "game": "bluff",
            "stage": "question",
            "question": question,
            "base_answer": result["base_answer"],
            "lied": result["lied"],
            "questions_left": result["questions_left"],
        },
        fallback_reply="",
        session_id=chat_session_id,
        record_event=(
            f"Bluff question asked: {question}. Base answer given: {result['base_answer']}. "
            f"Lied this turn: {result['lied']}. Questions left: {result['questions_left']}."
        ),
        instruction=(
            "Generate one short follow-up taunt or hint after the base answer. "
            "Do not repeat the base answer text and do not change its facts."
        ),
    ).strip()
    if follow_up:
        result["answer"] = f"{result['base_answer']} {follow_up}"
    del result["base_answer"]
    del result["lied"]
    return result


def guess_bluff_answer(
    session_id: str,
    guess: int,
    personality: str,
    chat_session_id: str | None = None,
) -> dict:
    def mutate(state: dict) -> dict:
        session = _get_session(state, session_id)
        correct = guess == session["target"]

        state["games_played"] += 1
        if correct:
            state["score"] += 20
            state["streak"] += 1
            message = "Sheeesh, tune bluff tod diya. Respect."
        else:
            state["score"] = max(0, state["score"] - 5)
            state["streak"] = 0
            message = f"Wrong guess. Number {session['target']} tha. Mind games mein aur grind kar."

        if personality == "chill" and not correct:
            message = f"Close try. Hidden number {session['target']} tha. Next round better hoga."

        del state["bluff_sessions"][session_id]

        return {
            "correct": correct,
            "message": message,
            "revealed_target": session["target"],
            "score": state["score"],
            "streak": state["streak"],
        }

    result = update_state(mutate)
    follow_up = generate_game_commentary(
        event_type="bluff_guess",
        personality=personality,
        context={
            "game": "bluff",
            "stage": "guess",
            "guess": guess,
            "correct": result["correct"],
            "revealed_target": result["revealed_target"],
            "score": result["score"],
            "streak": result["streak"],
        },
        fallback_reply="",
        session_id=chat_session_id,
        record_event=(
            f"Bluff game resolved. Player guessed {guess}. "
            f"Correct: {result['correct']}. Hidden number was {result['revealed_target']}."
        ),
        instruction=(
            "Generate one short follow-up reaction after the base result message. "
            "Do not repeat the same facts."
        ),
    ).strip()
    if follow_up:
        result["message"] = f"{result['message']} {follow_up}"
    del result["revealed_target"]
    return result
