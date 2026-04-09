import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./cubecoach.db"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080
    anthropic_api_key: str = ""
    jwt_secret: str = "dev-secret-key-change-in-production"
    jwt_expire_minutes: int = 10080
    use_mock_ai: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
