import os
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app import app
from services import llm
from services.storage import load_state


class ApiUpgradeTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.state_file = Path(self.temp_dir.name) / "state.json"
        os.environ["GAMEBUDDY_STATE_FILE"] = str(self.state_file)
        os.environ.pop("OPENAI_API_KEY", None)
        os.environ.pop("NVIDIA_API_KEY", None)
        os.environ.pop("TOGETHER_API_KEY", None)
        self.client = TestClient(app)

    def tearDown(self) -> None:
        self.temp_dir.cleanup()
        os.environ.pop("GAMEBUDDY_STATE_FILE", None)

    def test_chat_creates_and_reuses_session(self) -> None:
        first_response = self.client.post(
            "/chat",
            json={
                "message": "hello",
                "personality": "savage",
                "context": {"screen": "home"},
            },
        )
        self.assertEqual(first_response.status_code, 200)
        first_payload = first_response.json()
        self.assertIn("session_id", first_payload)
        self.assertTrue(first_payload["session_id"])

        second_response = self.client.post(
            "/chat",
            json={
                "message": "remember me",
                "personality": "savage",
                "session_id": first_payload["session_id"],
                "context": {"screen": "home"},
            },
        )
        self.assertEqual(second_response.status_code, 200)
        second_payload = second_response.json()
        self.assertEqual(second_payload["session_id"], first_payload["session_id"])

        state = load_state()
        session = state["chat_sessions"][first_payload["session_id"]]
        self.assertEqual(session["personality"], "savage")
        self.assertEqual(len(session["messages"]), 4)

    def test_invalid_cricket_choice_is_rejected(self) -> None:
        response = self.client.post(
            "/cricket/predict",
            json={"choice": "100+", "personality": "savage"},
        )
        self.assertEqual(response.status_code, 422)

    def test_invalid_bluff_guess_is_rejected(self) -> None:
        response = self.client.post(
            "/bluff/guess",
            json={
                "session_id": "missing",
                "guess": 77,
                "personality": "chill",
            },
        )
        self.assertEqual(response.status_code, 422)

    def test_gameplay_records_context_into_chat_session(self) -> None:
        chat_response = self.client.post(
            "/chat",
            json={
                "message": "start",
                "personality": "chill",
                "context": {"screen": "home"},
            },
        )
        session_id = chat_response.json()["session_id"]

        cricket_response = self.client.post(
            "/cricket/predict",
            json={
                "choice": "<6",
                "personality": "chill",
                "chat_session_id": session_id,
            },
        )
        self.assertEqual(cricket_response.status_code, 200)

        state = load_state()
        session = state["chat_sessions"][session_id]
        self.assertGreaterEqual(len(session["messages"]), 4)
        self.assertEqual(session["last_context"]["game"], "cricket")

    def test_sanitize_model_reply_removes_thinking_content(self) -> None:
        raw_reply = """
        <think>private reasoning here</think>
        ```thinking
        hidden chain of thought
        ```
        System prompt: do not leak me
        Final answer for the player.
        """
        self.assertEqual(llm._sanitize_model_reply(raw_reply), "Final answer for the player.")

    def test_nvidia_request_uses_stream_and_thinking(self) -> None:
        os.environ["NVIDIA_API_KEY"] = "fake-key"
        os.environ["NVIDIA_MODEL"] = "deepseek-ai/deepseek-v3.1"
        os.environ["NVIDIA_THINKING_MODE"] = "true"

        request = llm._build_completion_request(
            [{"role": "user", "content": "hello"}]
        )

        self.assertEqual(request["model"], "deepseek-ai/deepseek-v3.1")
        self.assertTrue(request["stream"])
        self.assertEqual(
            request["extra_body"],
            {"chat_template_kwargs": {"thinking": True}},
        )


if __name__ == "__main__":
    unittest.main()
