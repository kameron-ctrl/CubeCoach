from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, func
from models.database import Base


class AlgorithmMastery(Base):
    __tablename__ = "algorithm_mastery"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    algorithm_name = Column(String, nullable=False)  # e.g. "OLL-1", "PLL-T"
    algorithm_notation = Column(String, nullable=False)
    description = Column(Text, default="")
    ease_factor = Column(Float, default=2.5)
    interval_days = Column(Integer, default=1)
    repetitions = Column(Integer, default=0)
    next_review = Column(DateTime, nullable=True)
    last_reviewed = Column(DateTime, nullable=True)
