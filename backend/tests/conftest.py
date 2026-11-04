"""Run the API against a throwaway SQLite file with mock AI, never the real cubecoach.db."""

import os
import sys
import tempfile
from pathlib import Path

import pytest

# models.database reads DATABASE_URL at import time, so set it before importing the app.
_DB_DIR = tempfile.mkdtemp(prefix="cubecoach-test-")
os.environ["DATABASE_URL"] = f"sqlite:///{_DB_DIR}/test.db"
os.environ["USE_MOCK_AI"] = "true"
os.environ.setdefault("JWT_SECRET", "test-secret")
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client
