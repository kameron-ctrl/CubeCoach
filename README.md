# CubeCoach

AI-powered Rubik's Cube learning platform. Learn to solve step by step with adaptive coaching, 3D visualization, and spaced repetition algorithm drills.

---

## Features

- **3D Interactive Cube** -- Three.js Rubik's cube with animated move sequences, orbit controls, and click-to-color state input. Move logic verified against kociemba (200/200 end-to-end tests).
- **AI Coaching** -- Claude-powered step-by-step explanations adapted to your skill level, with analogies, check-in questions, and physical action prompts.
- **Spaced Repetition** -- SM-2 algorithm flashcards for all 57 OLL and 21 PLL cases with ease factor tracking and review scheduling.
- **Progress Tracking** -- Solve time line charts, algorithm mastery heatmaps, and streak tracking.
- **Multiple Methods** -- Supports Beginner and CFOP solving methods.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Three.js, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Cube Solver | kociemba library |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT via python-jose |

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- SQLite (included, no setup needed for local dev)
- PostgreSQL 16 (optional, for production -- Docker Compose provided)

---

## Quick Start

### 1. Clone the repository

```
git clone https://github.com/kameron-ctrl/CubeCoach.git
cd CubeCoach
```

### 2. Backend setup

```
cd backend

python -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your Anthropic API key if you want live AI coaching

uvicorn main:app --reload --port 8000
```

The API runs at http://localhost:8000. Tables and seed data (demo user + 78 algorithms) are created automatically on first startup. Visit /docs for the Swagger UI.

### 3. Frontend setup

```
cd frontend

npm install

cp .env.local.example .env.local

npm run dev
```

The app runs at http://localhost:3000.

### 4. PostgreSQL via Docker (optional)

If you want PostgreSQL instead of SQLite:

```
docker-compose up -d

# Update backend/.env:
# DATABASE_URL=postgresql://cubecoach:cubecoach_dev@localhost:5432/cubecoach
```

---

## Getting an Anthropic API Key

1. Go to console.anthropic.com
2. Create an account or sign in
3. Navigate to API Keys and generate a new key
4. Add it to backend/.env as ANTHROPIC_API_KEY=sk-ant-...
5. Set USE_MOCK_AI=false in backend/.env to enable live coaching

The app runs in mock AI mode by default. Mock coaching returns reasonable placeholder responses so you can develop and test without an API key.

---

## Project Structure

```
cubecoach/
  frontend/
    app/                  Pages (dashboard, solve, flashcards)
    components/           React components (CubeCanvas, CoachPanel, etc.)
    lib/                  API client, types, cube state utilities
  backend/
    main.py               FastAPI entrypoint
    routers/              API route handlers
    services/             Business logic (solver, SRS, AI prompts)
    models/               SQLAlchemy ORM models
    schemas/              Pydantic request/response schemas
    seed.py               Demo user + algorithm seed data
  docker-compose.yml      PostgreSQL for production
```

---

## API Endpoints

### Auth
- POST /auth/register -- Create user, returns JWT
- POST /auth/login -- Validate credentials, returns JWT
- GET /auth/me -- Current user profile

### Solve
- POST /solve/submit -- Submit 54-char cube state, returns solution steps
- GET /solve/session/{id} -- Get session with all steps
- POST /solve/complete -- Mark session complete with solve time

### Coach
- POST /coach/explain -- Get AI coaching for current step
- GET /coach/history/{session_id} -- Coaching history for a session

### Flashcards
- GET /flashcards/due -- Algorithms due for review today
- GET /flashcards/all -- All algorithms with mastery status
- GET /flashcards/stats -- Mastery statistics
- POST /flashcards/review -- Submit review rating, updates SM-2 scheduling

Full interactive docs available at http://localhost:8000/docs when the backend is running.

---

## License

MIT
