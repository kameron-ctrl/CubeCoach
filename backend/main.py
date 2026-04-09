from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import Base, engine

# Create tables eagerly (works for both uvicorn and TestClient)
Base.metadata.create_all(bind=engine)

# Seed demo data
from seed import seed
seed()

app = FastAPI(title="CubeCoach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, coach, flashcards, solve

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(coach.router, prefix="/coach", tags=["coach"])
app.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
app.include_router(solve.router, prefix="/solve", tags=["solve"])


@app.get("/health")
def health():
    return {"status": "ok"}
