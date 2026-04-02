import random
import uuid

from fastapi import HTTPException

from services.storage import load_state, save_state


def _truthful_reply(target: int, question: str) -> str:
    lower_question = question.lower()
    if "even" in lower_question or "odd" in lower_question:
        return "Haan" if target % 2 == 0 else "Nahi"
    if "greater than" in lower_question:
        try:
            threshold = int(lower_question.split("greater than")[-1].strip().split()[0])
            return "Haan" if target > threshold else "Nahi"
        except (ValueError, IndexError):
            return f"Hint de raha hoon: number {target % 10} pe end nahi hota."
    if "less than" in lower_question:
        try:
            threshold = int(lower_question.split("less than")[-1].strip().split()[0])
            return "Haan" if target < threshold else "Nahi"
        except (ValueError, IndexError):
            return f"Range tight rakh. Number {target - 3} ke upar hai."
    if "prime" in lower_question:
        if target < 2:
            return "Nahi"
        for number in range(2, int(target ** 0.5) + 1):
            if target % number == 0:
                return "Nahi"
        return "Haan"
    return f"Clue time: ye number {target - 5} aur {target + 5} ke beech chill kar raha hai."


def _style_reply(answer: str, lied: bool, personality: str) -> str:
    prefix = "Bluff alert: " if lied else "Seedha clue: "
    if personality == "chill":
        prefix = "Soft clue: " if not lied else "Thoda sa confusion: "
    return prefix + answer


def _get_session(session_id: str) -> tuple[dict, dict]:
    state = load_state()
    session = state["bluff_sessions"].get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Bluff session not found")
    return state, session


def start_bluff_game(personality: str) -> dict:
    state = load_state()
    session_id = str(uuid.uuid4())
    target = random.randint(1, 50)
    state["bluff_sessions"][session_id] = {
        "target": target,
        "questions_left": 5,
        "lies_used": 0,
        "personality": personality,
    }
    save_state(state)

    intro = (
        "Maine 1 se 50 ke beech ek number lock kiya hai. 5 sawaal poochh le, par yaad rakh main kabhi kabhi bluff bhi karta hoon."
    )
    return {"session_id": session_id, "intro": intro, "questions_left": 5}


def ask_bluff_question(session_id: str, question: str, personality: str) -> dict:
    state, session = _get_session(session_id)
    if session["questions_left"] <= 0:
        raise HTTPException(status_code=400, detail="No questions left. Make a guess.")

    truthful_answer = _truthful_reply(session["target"], question)
    should_lie = random.random() < 0.35
    answer = truthful_answer

    if should_lie:
        yes_no_map = {"Haan": "Nahi", "Nahi": "Haan"}
        answer = yes_no_map.get(truthful_answer, "Main itna seedha clue kyun doon?")
        session["lies_used"] += 1

    session["questions_left"] -= 1
    state["bluff_sessions"][session_id] = session
    save_state(state)

    return {
        "answer": _style_reply(answer, should_lie, personality),
        "questions_left": session["questions_left"],
    }


def guess_bluff_answer(session_id: str, guess: int, personality: str) -> dict:
    state, session = _get_session(session_id)
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
    save_state(state)

    return {
        "correct": correct,
        "message": message,
        "score": state["score"],
        "streak": state["streak"],
    }
