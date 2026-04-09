from sqlalchemy import Column, Integer, String, DateTime, func
from models.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    current_method = Column(String, default="beginner")  # beginner, cfop, roux
    skill_level = Column(String, default="beginner")  # beginner, intermediate, advanced
    streak_days = Column(Integer, default=0)
    last_active = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
