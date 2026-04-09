from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ErrorResponse(BaseModel):
    error: str
    code: str


class SolveStep(BaseModel):
    step_number: int
    step_name: str
    moves: list[str]
    description: str


class SolveSubmitRequest(BaseModel):
    cube_state: str
    method: str = "beginner"


class SolveSubmitResponse(BaseModel):
    session_id: int
    total_moves: int
    optimal_moves: int
    steps: list[SolveStep]
    method_used: str


class SolveSessionResponse(BaseModel):
    id: int
    cube_state_input: str
    solution_moves: list[str]
    total_moves: int
    optimal_moves: int
    solve_time_seconds: Optional[float] = None
    method_used: str
    completed: bool
    created_at: Optional[datetime] = None
    steps: list[SolveStep]

    class Config:
        from_attributes = True


class SolveCompleteRequest(BaseModel):
    session_id: int
    solve_time_seconds: float


class SolveCompleteResponse(BaseModel):
    session_id: int
    solve_time_seconds: float
    total_moves: int
    completed: bool
