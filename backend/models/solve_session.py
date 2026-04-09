import json
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text, func
from models.database import Base


class SolveSession(Base):
    __tablename__ = "solve_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cube_state_input = Column(String(54), nullable=False)
    solution_moves_json = Column(Text, nullable=False, default="[]")
    total_moves = Column(Integer, default=0)
    optimal_moves = Column(Integer, default=0)
    solve_time_seconds = Column(Float, nullable=True)
    method_used = Column(String, default="beginner")
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    @property
    def solution_moves(self) -> list[str]:
        return json.loads(self.solution_moves_json) if self.solution_moves_json else []

    @solution_moves.setter
    def solution_moves(self, value: list[str]) -> None:
        self.solution_moves_json = json.dumps(value)
