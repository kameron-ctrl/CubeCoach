"""Solve router — cube solving endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import User
from models.solve_session import SolveSession
from routers.auth import get_current_user
from schemas.solve import (
    SolveSubmitRequest,
    SolveSubmitResponse,
    SolveSessionResponse,
    SolveCompleteRequest,
    SolveCompleteResponse,
    SolveStep,
    ErrorResponse,
)
from services.cube_solver import solver, validate_state

router = APIRouter()


@router.post(
    "/submit",
    response_model=SolveSubmitResponse,
    responses={400: {"model": ErrorResponse}},
)
def submit_cube_state(
    req: SolveSubmitRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SolveSubmitResponse:
    is_valid, error_msg = validate_state(req.cube_state)
    if not is_valid:
        raise HTTPException(status_code=400, detail={"error": error_msg, "code": "INVALID_CUBE_STATE"})

    try:
        moves = solver.solve(req.cube_state)
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"error": str(e), "code": "UNSOLVABLE_CUBE"})

    raw_steps = solver.split_into_steps(moves, method=req.method)
    steps = [
        SolveStep(
            step_number=s["step_number"] + 1,
            step_name=s["step_name"],
            moves=s["moves"],
            description=s["description"],
        )
        for s in raw_steps
    ]

    session = SolveSession(
        user_id=user.id,
        cube_state_input=req.cube_state,
        total_moves=len(moves),
        optimal_moves=len(moves),
        method_used=req.method,
        completed=False,
    )
    session.solution_moves = moves
    db.add(session)
    db.commit()
    db.refresh(session)

    return SolveSubmitResponse(
        session_id=session.id,
        total_moves=len(moves),
        optimal_moves=len(moves),
        steps=steps,
        method_used=req.method,
    )


@router.get(
    "/session/{session_id}",
    response_model=SolveSessionResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_solve_session(
    session_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SolveSessionResponse:
    session = (
        db.query(SolveSession)
        .filter(SolveSession.id == session_id, SolveSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail={"error": "Session not found", "code": "SESSION_NOT_FOUND"})

    raw_steps = solver.split_into_steps(session.solution_moves, method=session.method_used)
    steps = [
        SolveStep(
            step_number=s["step_number"] + 1,
            step_name=s["step_name"],
            moves=s["moves"],
            description=s["description"],
        )
        for s in raw_steps
    ]

    return SolveSessionResponse(
        id=session.id,
        cube_state_input=session.cube_state_input,
        solution_moves=session.solution_moves,
        total_moves=session.total_moves,
        optimal_moves=session.optimal_moves,
        solve_time_seconds=session.solve_time_seconds,
        method_used=session.method_used,
        completed=session.completed,
        created_at=session.created_at,
        steps=steps,
    )


@router.post(
    "/complete",
    response_model=SolveCompleteResponse,
    responses={404: {"model": ErrorResponse}},
)
def complete_solve(
    req: SolveCompleteRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SolveCompleteResponse:
    session = (
        db.query(SolveSession)
        .filter(SolveSession.id == req.session_id, SolveSession.user_id == user.id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail={"error": "Session not found", "code": "SESSION_NOT_FOUND"})

    session.completed = True
    session.solve_time_seconds = req.solve_time_seconds
    db.commit()
    db.refresh(session)

    return SolveCompleteResponse(
        session_id=session.id,
        solve_time_seconds=session.solve_time_seconds,
        total_moves=session.total_moves,
        completed=session.completed,
    )
