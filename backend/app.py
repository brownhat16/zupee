from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

from routes.bluff import router as bluff_router
from routes.chat import router as chat_router
from routes.cricket import router as cricket_router
from routes.stats import router as stats_router

app = FastAPI(title="GameBuddy AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats_router)
app.include_router(chat_router)
app.include_router(cricket_router)
app.include_router(bluff_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    detail = exc.detail if isinstance(exc.detail, str) else "Something went wrong."
    payload = {"detail": detail}

    if detail == "Bluff session not found":
        payload = {
            "detail": "Session expired. Start a new round.",
            "error_code": "bluff_session_expired",
            "recovery_action": "Start new round",
        }
    elif detail == "No questions left. Make a guess.":
        payload = {
            "detail": "No questions left in this round. Make your final guess now.",
            "error_code": "bluff_questions_exhausted",
            "recovery_action": "Submit guess",
        }

    return JSONResponse(status_code=exc.status_code, content=payload)


@app.get("/", response_class=HTMLResponse)
def root() -> str:
    return """
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>GameBuddy AI</title>
        <style>
          :root {
            --bg: #f5efe3;
            --card: rgba(255, 251, 245, 0.88);
            --ink: #1f1a17;
            --muted: #64574d;
            --accent: #cf5c36;
            --accent-2: #14746f;
            --line: rgba(31, 26, 23, 0.1);
            --shadow: 0 22px 50px rgba(78, 58, 41, 0.15);
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: "Space Grotesk", "Avenir Next", sans-serif;
            color: var(--ink);
            background:
              radial-gradient(circle at top left, rgba(207, 92, 54, 0.18), transparent 30%),
              radial-gradient(circle at top right, rgba(20, 116, 111, 0.18), transparent 28%),
              linear-gradient(135deg, #f8f2e8, var(--bg));
            min-height: 100vh;
          }
          .shell {
            max-width: 1080px;
            margin: 0 auto;
            padding: 32px 20px 48px;
          }
          .hero {
            display: grid;
            gap: 20px;
            margin-bottom: 24px;
          }
          .eyebrow {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(31, 26, 23, 0.06);
            color: var(--muted);
            font-size: 14px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0;
            font-size: clamp(40px, 8vw, 72px);
            line-height: 0.95;
            max-width: 10ch;
          }
          .subhead {
            max-width: 60ch;
            font-size: 18px;
            line-height: 1.6;
            color: var(--muted);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 18px;
            margin-top: 28px;
          }
          .card {
            background: var(--card);
            border: 1px solid var(--line);
            border-radius: 28px;
            box-shadow: var(--shadow);
            padding: 24px;
            backdrop-filter: blur(10px);
          }
          .card h2 {
            margin: 0 0 10px;
            font-size: 28px;
          }
          .card p {
            margin: 0 0 12px;
            color: var(--muted);
            line-height: 1.6;
          }
          .rule {
            font-size: 14px;
            color: var(--ink);
            background: rgba(20, 116, 111, 0.08);
            padding: 10px 12px;
            border-radius: 14px;
            margin-bottom: 14px;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 16px;
          }
          button, a.button {
            appearance: none;
            border: none;
            border-radius: 999px;
            padding: 12px 16px;
            font: inherit;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: transform 160ms ease, opacity 160ms ease;
          }
          button:hover, a.button:hover { transform: translateY(-1px); opacity: 0.96; }
          .primary { background: var(--ink); color: #fff; }
          .secondary { background: rgba(31, 26, 23, 0.08); color: var(--ink); }
          .teal { background: var(--accent-2); color: #fff; }
          .result {
            margin-top: 18px;
            min-height: 58px;
            border-radius: 18px;
            border: 1px dashed var(--line);
            padding: 14px;
            color: var(--muted);
            background: rgba(255, 255, 255, 0.4);
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 22px;
            color: var(--muted);
            font-size: 14px;
          }
          @media (max-width: 640px) {
            .shell { padding: 20px 14px 36px; }
            .card { border-radius: 22px; }
          }
        </style>
      </head>
      <body>
        <main class="shell">
          <section class="hero">
            <span class="eyebrow">Playable Right Now</span>
            <h1>Choose a game and start in one tap.</h1>
            <p class="subhead">
              Cricket Prediction is a fast score-bucket guesser. Bluff Master is a number hunt
              where the AI's clues may be true or false.
            </p>
          </section>

          <section class="grid">
            <article class="card">
              <h2>Cricket Prediction</h2>
              <p>Pick the run bucket you believe will land, then see whether your read was sharp or shaky.</p>
              <div class="actions">
                <button class="primary" onclick="playCricket('<6')">Play &lt;6</button>
                <button class="secondary" onclick="playCricket('6-10')">Play 6-10</button>
                <button class="secondary" onclick="playCricket('10+')">Play 10+</button>
              </div>
            </article>

            <article class="card">
              <h2>Bluff Master</h2>
              <p>Ask up to five yes/no questions, then guess the hidden number before the bluff catches you.</p>
              <div class="rule">Bluff rule: the AI's clues may mislead you, so cross-check your hints.</div>
              <div class="actions">
                <button class="teal" onclick="startBluff()">Start Bluff</button>
                <a class="button secondary" href="/docs">Open API Docs</a>
              </div>
            </article>
          </section>

          <section class="card" style="margin-top: 18px;">
            <h2>Live Result</h2>
            <p>Try a round here or wire the same endpoints into your app.</p>
            <div id="result" class="result">Waiting for your first move.</div>
            <div class="footer">Available endpoints: /stats, /chat, /cricket/predict, /bluff/start, /bluff/ask, /bluff/guess</div>
          </section>
        </main>

        <script>
          const resultNode = document.getElementById("result");

          async function postJson(path, body) {
            resultNode.textContent = "Loading...";
            const response = await fetch(path, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(body)
            });
            const payload = await response.json();
            resultNode.textContent = JSON.stringify(payload, null, 2);
          }

          function playCricket(choice) {
            postJson("/cricket/predict", { choice, personality: "chill" });
          }

          function startBluff() {
            postJson("/bluff/start", { personality: "chill" });
          }
        </script>
      </body>
    </html>
    """
