"""Smoke tests: each main API flow works end to end against a fresh database."""

import uuid

# Example scramble from the kociemba README (URFDLB facelet order).
SCRAMBLED = "DRLUUBFBRBLURRLRUBLRDDFDLFUFUFFDBRDUBRUFLLFDDBFLUBLRBD"
PASSWORD = "correct-horse-1"


def register(client) -> str:
    name = f"user{uuid.uuid4().hex[:8]}"
    response = client.post(
        "/auth/register",
        json={"username": name, "email": f"{name}@example.com", "password": PASSWORD},
    )
    assert response.status_code == 200, response.text
    return name


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_register_login_and_me(client):
    name = register(client)

    login = client.post("/auth/login", data={"username": name, "password": PASSWORD})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["username"] == name


def test_duplicate_username_is_rejected(client):
    name = register(client)

    again = client.post(
        "/auth/register",
        json={"username": name, "email": f"other-{name}@example.com", "password": PASSWORD},
    )

    assert again.status_code == 400


def test_wrong_password_is_rejected(client):
    name = register(client)

    login = client.post("/auth/login", data={"username": name, "password": "wrong-password"})

    assert login.status_code == 401


def test_invalid_cube_state_is_rejected(client):
    response = client.post("/solve/submit", json={"cube_state": "UUU"})

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "INVALID_CUBE_STATE"


def test_scrambled_cube_is_solved_and_saved(client):
    response = client.post("/solve/submit", json={"cube_state": SCRAMBLED})

    assert response.status_code == 200, response.text
    body = response.json()
    assert body["total_moves"] > 0
    assert body["steps"] and all(step["moves"] is not None for step in body["steps"])

    session = client.get(f"/solve/session/{body['session_id']}")
    assert session.status_code == 200
    assert session.json()["cube_state_input"] == SCRAMBLED


def test_seeded_flashcards_are_available(client):
    response = client.get("/flashcards/all")

    assert response.status_code == 200
    assert len(response.json()) >= 57  # every OLL case is seeded


def test_coach_explains_a_step_with_mock_ai(client):
    session_id = client.post("/solve/submit", json={"cube_state": SCRAMBLED}).json()["session_id"]

    response = client.post(
        "/coach/explain",
        json={
            "session_id": session_id,
            "step_number": 1,
            "cube_state": SCRAMBLED,
            "move_sequence": "R U R' U'",
            "step_name": "Cross",
        },
    )

    assert response.status_code == 200, response.text
    assert "step 1" in response.json()["coaching_text"]
