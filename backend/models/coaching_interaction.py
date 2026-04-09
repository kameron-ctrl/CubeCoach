from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from models.database import Base


class CoachingInteraction(Base):
    __tablename__ = "coaching_interactions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("solve_sessions.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    step_number = Column(Integer, default=0)
    move_sequence = Column(String, default="")
    coaching_text = Column(Text, nullable=False)
    check_in_question = Column(Text, default="")
    next_physical_action = Column(Text, default="")
    analogy_used = Column(String, nullable=True)
    mood_flag = Column(String, default="neutral")  # neutral, frustrated, progressing, breakthrough
    created_at = Column(DateTime, server_default=func.now())
