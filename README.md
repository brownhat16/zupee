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
- or `NVIDIA_API_KEY`, `NVIDIA_MODEL=google/gemma-2-27b-it`, and `OPENAI_BASE_URL=https://integrate.api.nvidia.com/v1`
- or `TOGETHER_API_KEY`, `TOGETHER_MODEL`, and `OPENAI_BASE_URL=https://api.together.xyz/v1`

Optional generation controls:

- `LLM_TEMPERATURE`
- `LLM_TOP_P`
- `LLM_MAX_TOKENS`

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

2. If your emulator/device cannot reach localhost, update `frontend/api/client.js` to your machine IP.

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
- Score and streak are stored in `backend/data/state.json`.
- Personality modes included: `savage` and `chill`.
