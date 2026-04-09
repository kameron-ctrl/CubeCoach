"""Flashcards router — spaced repetition endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session

from models.database import get_db
from models.user import User
from models.algorithm_mastery import AlgorithmMastery
from routers.auth import get_current_user
from schemas.coach import FlashcardResponse, FlashcardReviewRequest, FlashcardReviewResponse
from schemas.solve import ErrorResponse
from services.srs import calculate_next_review

router = APIRouter()


@router.get("/due", response_model=list[FlashcardResponse])
def get_due_flashcards(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc).replace(tzinfo=None)  # SQLite stores naive
    due = (
        db.query(AlgorithmMastery)
        .filter(
            AlgorithmMastery.user_id == user.id,
            AlgorithmMastery.next_review <= now,
        )
        .order_by(AlgorithmMastery.next_review.asc())
        .all()
    )
    return due


@router.get("/all", response_model=list[FlashcardResponse])
def get_all_flashcards(
    category: Optional[str] = Query(None, pattern=r"^(OLL|PLL)$"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AlgorithmMastery).filter(AlgorithmMastery.user_id == user.id)
    if category:
        query = query.filter(AlgorithmMastery.algorithm_name.startswith(category))
    return query.order_by(AlgorithmMastery.algorithm_name.asc()).all()


@router.get("/stats")
def get_flashcard_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
    all_cards = db.query(AlgorithmMastery).filter(AlgorithmMastery.user_id == user.id).all()
    total = len(all_cards)
    due_count = sum(1 for c in all_cards if c.next_review and c.next_review <= now_naive)
    mastered_count = sum(1 for c in all_cards if c.repetitions >= 5 and c.ease_factor >= 2.5)
    return {"total": total, "due": due_count, "mastered": mastered_count}


@router.post("/review", response_model=FlashcardReviewResponse, responses={404: {"model": ErrorResponse}})
def review_flashcard(
    req: FlashcardReviewRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    mastery = (
        db.query(AlgorithmMastery)
        .filter(AlgorithmMastery.id == req.algorithm_id, AlgorithmMastery.user_id == user.id)
        .first()
    )
    if not mastery:
        raise HTTPException(status_code=404, detail={"error": "Algorithm not found", "code": "ALGORITHM_NOT_FOUND"})

    result = calculate_next_review(
        ease_factor=mastery.ease_factor,
        interval=mastery.interval_days,
        repetitions=mastery.repetitions,
        quality=req.quality,
    )

    mastery.ease_factor = result["ease_factor"]
    mastery.interval_days = result["interval_days"]
    mastery.repetitions = result["repetitions"]
    mastery.next_review = result["next_review"].replace(tzinfo=None)  # SQLite naive
    mastery.last_reviewed = datetime.now(timezone.utc).replace(tzinfo=None)

    db.commit()
    db.refresh(mastery)

    return FlashcardReviewResponse(
        algorithm_id=mastery.id,
        new_ease_factor=mastery.ease_factor,
        new_interval_days=mastery.interval_days,
        next_review=mastery.next_review,
    )
