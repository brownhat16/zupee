# GameBuddy AI

GameBuddy AI is a simple AI-first entertainment companion with:

- Cricket Prediction Battle
- Bluff Master AI

The project is split into:

- `backend/` FastAPI API with lightweight JSON storage
- `frontend/` Expo React Native Android app

## Deployment fit

- `Render` or `Railway`: recommended for the FastAPI backend
- `Vercel`: works for demo API hosting, but JSON file storage is ephemeral on serverless
- `Expo EAS`: recommended for Android builds and APK delivery

## Backend setup

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Optional: configure LLM keys:

```bash
cp .env.example .env
```

Set either:

- `OPENAI_API_KEY` and optionally `OPENAI_MODEL`
- or `NVIDIA_API_KEY`, `NVIDIA_MODEL=deepseek-ai/deepseek-v3.1`, and `OPENAI_BASE_URL=https://integrate.api.nvidia.com/v1`
- or `TOGETHER_API_KEY`, `TOGETHER_MODEL`, and `OPENAI_BASE_URL=https://api.together.xyz/v1`

Optional generation controls:

- `LLM_TEMPERATURE`
- `LLM_TOP_P`
- `LLM_MAX_TOKENS`
- `LLM_TIMEOUT_SECONDS`
- `LLM_MAX_RETRIES`
- `NVIDIA_THINKING_MODE`
- `CHAT_SESSION_MAX_MESSAGES`
- `CHAT_SESSION_TTL_SECONDS`
- `CHAT_SUMMARY_CHAR_LIMIT`
- `GAMEBUDDY_STATE_FILE`

4. Run the API:

```bash
uvicorn app:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

## Frontend setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Configure the frontend API URL in `frontend/.env`:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
```

- Use `http://10.0.2.2:8000` for the Android emulator.
- Use your machine's LAN IP for a physical device.
- Use your deployed backend URL for remote testing.

3. Start Expo:

```bash
npm run start
```

4. Launch Android:

```bash
npm run android
```

## APK build

For a local debug APK:

```bash
cd frontend
npx expo prebuild
cd android
./gradlew assembleDebug
```

The APK will be generated under `frontend/android/app/build/outputs/apk/debug/`.

For cloud builds, use EAS:

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

## Deploy backend on Render

This repo includes [render.yaml](/Users/apple/Downloads/Zupee/render.yaml) and [backend/Dockerfile](/Users/apple/Downloads/Zupee/backend/Dockerfile).

Steps:

1. Push the repo to GitHub.
2. Create a new Render Blueprint or Web Service from the repo.
3. Render will detect `render.yaml`.
4. Set `NVIDIA_API_KEY` in Render dashboard.
5. Deploy.

Your public API URL will look like:

```text
https://gamebuddy-ai-api.onrender.com
```

Use that URL in the frontend via `EXPO_PUBLIC_API_URL`.

## Deploy backend on Vercel

This repo includes [vercel.json](/Users/apple/Downloads/Zupee/vercel.json) and [api/index.py](/Users/apple/Downloads/Zupee/api/index.py).

Steps:

1. Push the repo to GitHub.
2. Import the project into Vercel.
3. Set env vars:
   `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `OPENAI_BASE_URL`, `LLM_TEMPERATURE`, `LLM_TOP_P`, `LLM_MAX_TOKENS`
4. Deploy.

Important limitation:

- Vercel serverless does not give you durable local file persistence, so `backend/data/state.json` will reset or behave inconsistently across invocations.
- For a real game backend with score persistence, use Render, Railway, Fly.io, or swap JSON storage for Redis/Postgres/Supabase.

## Point frontend to deployed backend

Set [frontend/.env.example](/Users/apple/Downloads/Zupee/frontend/.env.example) as a real `.env` file in `frontend/`:

```bash
EXPO_PUBLIC_API_URL=https://your-backend-url
```

Then start Expo again:

```bash
cd frontend
npm install
npm run start
```

## API summary

- `POST /chat`
- `POST /cricket/predict`
- `POST /bluff/start`
- `POST /bluff/ask`
- `POST /bluff/guess`
- `GET /stats`

## Notes

- The app works without external LLM access using built-in fallback responses.
- Score, streak, bluff sessions, and chat sessions are stored in `backend/data/state.json` by default.
- `POST /chat` now supports `session_id` and returns `session_id` with the reply so the app can keep server-side memory.
- Gameplay routes accept optional `chat_session_id` so cricket and bluff commentary can reuse the same agent session.
- Personality modes are validated as `savage` and `chill`.
- If you see `Cannot connect to Metro`, start Expo again with `cd frontend && npm run start`, then reopen the app on the same network/device.
