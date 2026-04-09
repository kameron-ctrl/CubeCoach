"""Coach router — AI coaching endpoints."""

import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config import settings
from models.database import get_db
from models.user import User
from models.coaching_interaction import CoachingInteraction
from routers.auth import get_current_user
from schemas.coach import CoachExplainRequest, CoachExplainResponse, CoachRequest, CoachResponse

router = APIRouter()


def _build_system_prompt(user: User, req: CoachExplainRequest) -> str:
    return f"""You are CubeCoach, an expert Rubik's cube instructor. Your personality is patient, encouraging, and precise. You never overwhelm the student.

STUDENT PROFILE:
Method: {user.current_method}
Skill level: {user.skill_level}
Streak: {user.streak_days} days

CURRENT CUBE STATE: {req.cube_state}
OPTIMAL NEXT STEP: {req.move_sequence}
STEP NAME: {req.step_name}
STEP: {req.step_number}

COACHING RULES:
1. Never reveal future steps.
2. Always explain WHY before giving the moves.
3. Use one analogy.
4. Match language to skill level. Beginner = plain English. Intermediate = notation ok. Advanced = discuss efficiency.
5. Max 3-5 sentences, then ask ONE check-in question.
6. End with one specific physical action to try.

Return ONLY valid JSON, no markdown, no preamble:
{{
  "coaching_text": "...",
  "check_in_question": "...",
  "next_physical_action": "...",
  "analogy_used": "...",
  "introduced_notation": [],
  "mood_flag": "neutral | frustrated | progressing | breakthrough"
}}"""


def _mock_coaching(req: CoachExplainRequest) -> dict:
    return {
        "coaching_text": f"Great job getting to step {req.step_number}! For '{req.step_name}', we need to execute {req.move_sequence}. Think of this like fitting puzzle pieces — each move slots a piece into place.",
        "check_in_question": "Can you identify which piece needs to move first?",
        "next_physical_action": f"Try executing the first move of {req.move_sequence} and observe what changes.",
        "analogy_used": "fitting puzzle pieces",
        "introduced_notation": [],
        "mood_flag": "progressing",
    }


@router.post("/explain", response_model=CoachExplainResponse)
def explain_step(
    req: CoachExplainRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if settings.use_mock_ai or not settings.anthropic_api_key:
        result = _mock_coaching(req)
    else:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1000,
                system=_build_system_prompt(user, req),
                messages=[{"role": "user", "content": f"Explain step {req.step_number}: {req.step_name} with moves {req.move_sequence}"}],
            )
            text = response.content[0].text
            result = json.loads(text)
        except Exception:
            result = _mock_coaching(req)

    # Log interaction
    interaction = CoachingInteraction(
        session_id=req.session_id,
        user_id=user.id,
        step_number=req.step_number,
        move_sequence=req.move_sequence,
        coaching_text=result.get("coaching_text", ""),
        check_in_question=result.get("check_in_question", ""),
        next_physical_action=result.get("next_physical_action", ""),
        analogy_used=result.get("analogy_used"),
        mood_flag=result.get("mood_flag", "neutral"),
    )
    db.add(interaction)
    db.commit()

    return CoachExplainResponse(**result)


@router.post("/ask", response_model=CoachResponse)
def ask_coach(request: CoachRequest, db: Session = Depends(get_db)):
    response_text = f"Great question about '{request.message}'! Keep practicing your algorithms."
    interaction = CoachingInteraction(
        user_id=request.user_id,
        user_message="",
        coaching_text=response_text,
    )
    db.add(interaction)
    db.commit()
    return CoachResponse(response=response_text)


@router.get("/history/{session_id}")
def get_history(session_id: int, db: Session = Depends(get_db)):
    interactions = (
        db.query(CoachingInteraction)
        .filter(CoachingInteraction.session_id == session_id)
        .order_by(CoachingInteraction.created_at.asc())
        .all()
    )
    return interactions
