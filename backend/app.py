from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def root() -> dict:
    return {
        "app": "GameBuddy AI API",
        "status": "ok",
        "endpoints": [
            "/stats",
            "/chat",
            "/cricket/predict",
            "/bluff/start",
            "/bluff/ask",
            "/bluff/guess",
        ],
    }
