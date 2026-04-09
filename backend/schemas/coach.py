from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CoachRequest(BaseModel):
    user_id: int
    message: str


class CoachResponse(BaseModel):
    response: str


class CoachExplainRequest(BaseModel):
    session_id: int
    step_number: int
    cube_state: str
    move_sequence: str
    step_name: str


class CoachExplainResponse(BaseModel):
    coaching_text: str
    check_in_question: str
    next_physical_action: str
    analogy_used: Optional[str] = None
    introduced_notation: list[str] = []
    mood_flag: str = "neutral"


# Flashcard schemas
class FlashcardResponse(BaseModel):
    id: int
    algorithm_name: str
    algorithm_notation: str
    description: str = ""
    ease_factor: float
    interval_days: int
    repetitions: int
    next_review: Optional[datetime] = None
    last_reviewed: Optional[datetime] = None

    class Config:
        from_attributes = True


class FlashcardReviewRequest(BaseModel):
    algorithm_id: int
    quality: int  # 0-5


class FlashcardReviewResponse(BaseModel):
    algorithm_id: int
    new_ease_factor: float
    new_interval_days: int
    next_review: Optional[datetime] = None
