# CubeCoach

**AI-powered Rubik's cube learning platform** — Learn to solve step by step with adaptive coaching, 3D visualization, and spaced repetition algorithm drills.

![Stack](https://img.shields.io/badge/Next.js_14-black?style=flat&logo=next.js)
![Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Stack](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js)

---

## Features

* **3D Interactive Cube** — Three.js Rubik's cube with click-to-color facelets, animated moves, and orbit controls
* **AI Coaching** — Claude-powered step-by-step explanations adapted to your skill level (mock mode included)
* **Spaced Repetition** — SM-2 algorithm flashcards for all 57 OLL and 21 PLL cases
* **Progress Tracking** — Solve time graphs, algorithm mastery heatmaps, streak tracking
* **Multiple Methods** — Supports Beginner and CFOP solving methods

---

## Quick Start

### Prerequisites
* **Node.js** 18+ and npm
* **Python** 3.11+

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
pip install -r requirements.txt

# Configure (optional — defaults work out of the box)
cp .env.example .env

# Start the server (auto-creates SQLite DB + seeds 78 algorithms + demo user)
uvicorn main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App at http://localhost:3000

---

## How It Works

1. **Solve page**: Click facelets on the 3D cube to set your cube's colors, pick a method (Beginner/CFOP), click **Solve This Cube**
2. The backend validates the state, runs kociemba to find the optimal solution, and splits it into teaching steps
3. The AI coach explains each step with analogies, check-in questions, and specific physical actions
4. **Flashcards page**: Review OLL/PLL algorithms with SM-2 spaced repetition — rate each card and the system schedules your next review
5. **Dashboard**: Track your progress with solve time charts and algorithm mastery heatmaps

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user (demo user fallback) |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/solve/submit` | Submit cube state, get solution steps |
| POST | `/solve/complete` | Mark session complete with solve time |
| POST | `/coach/explain` | Get AI coaching for a step |
| GET | `/flashcards/due` | Get algorithms due for review |
| GET | `/flashcards/all` | Get all algorithms with mastery data |
| GET | `/flashcards/stats` | Get mastery statistics |
| POST | `/flashcards/review` | Submit review rating (SM-2) |

---

## Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=sqlite:///./cubecoach.db
ANTHROPIC_API_KEY=your_key_here      # optional, mock mode works without it
JWT_SECRET=change-in-production
USE_MOCK_AI=true                     # set to false to use real Claude
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Three.js, Recharts |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Cube Solver | kociemba library |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT via python-jose |

---

## License

MIT
