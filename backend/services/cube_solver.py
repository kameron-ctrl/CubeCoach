"""Cube solver service — wraps kociemba for solving + splits into teaching steps."""

from __future__ import annotations

import re
from typing import Optional


# ── Move parsing helpers ────────────────────────────────────────────────────

VALID_FACES_SET = {"U", "R", "F", "D", "L", "B"}
MOVE_PATTERN = re.compile(r"^([URFDLB])([2']?)$")


def parse_move(move: str) -> Optional[tuple[str, str]]:
    """Parse a move string like 'R', 'U2', \"F'\" into (face, modifier)."""
    m = MOVE_PATTERN.match(move.strip())
    if m:
        return m.group(1), m.group(2)
    return None


def split_solution_string(solution: str) -> list[str]:
    """Split a kociemba solution string into individual moves."""
    return [m.strip() for m in solution.strip().split() if m.strip()]


# ── Cube state validation ──────────────────────────────────────────────────

def validate_state(state_string: str) -> tuple[bool, str]:
    """
    Validate a 54-character cube state string.

    Returns (is_valid, error_message).
    The string maps facelets in order: U1-U9, R1-R9, F1-F9, D1-D9, L1-L9, B1-B9.
    Each face letter must appear exactly 9 times.
    Center facelets (indices 4,13,22,31,40,49) must match the expected face.
    """
    if len(state_string) != 54:
        return False, f"State must be exactly 54 characters, got {len(state_string)}"

    # Check all characters are valid
    for i, ch in enumerate(state_string):
        if ch not in VALID_FACES_SET:
            return False, f"Invalid character '{ch}' at position {i}. Use U/R/F/D/L/B only."

    # Check each face appears exactly 9 times
    counts: dict[str, int] = {}
    for ch in state_string:
        counts[ch] = counts.get(ch, 0) + 1

    for face in VALID_FACES_SET:
        count = counts.get(face, 0)
        if count != 9:
            return False, f"Face '{face}' appears {count} times, expected 9"

    # Check center facelets match expected faces
    expected_centers = {
        4: "U",   # U center
        13: "R",  # R center
        22: "F",  # F center
        31: "D",  # D center
        40: "L",  # L center
        49: "B",  # B center
    }
    for idx, expected in expected_centers.items():
        if state_string[idx] != expected:
            return False, (
                f"Center facelet at position {idx} is '{state_string[idx]}', "
                f"expected '{expected}'. Centers must match standard orientation."
            )

    return True, ""


# ── Solver ─────────────────────────────────────────────────────────────────

class CubeSolver:
    """Wraps kociemba to solve cubes and split solutions into teaching steps."""

    def __init__(self) -> None:
        self._kociemba_available = False
        try:
            import kociemba as _k
            self._kociemba = _k
            self._kociemba_available = True
        except ImportError:
            self._kociemba = None

    @property
    def is_available(self) -> bool:
        return self._kociemba_available

    def solve(self, state_string: str) -> list[str]:
        """
        Solve the cube from the given state.
        Returns a list of move strings, e.g. ["R", "U", "R'", "U'", "F2"].

        If kociemba is not installed, returns a mock solution for development.
        """
        is_valid, error = validate_state(state_string)
        if not is_valid:
            raise ValueError(f"Invalid cube state: {error}")

        # Already solved
        if state_string == "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB":
            return []

        if not self._kociemba_available:
            return self._mock_solution()

        try:
            solution_str: str = self._kociemba.solve(state_string)
            return split_solution_string(solution_str)
        except Exception as e:
            raise ValueError(f"Could not solve cube: {str(e)}")

    def split_into_steps(
        self, moves: list[str], method: str = "beginner"
    ) -> list[dict]:
        """
        Group moves into logical solving stages.

        For 'beginner' method: layer1, layer2, layer3
        For 'cfop' method: cross, f2l, oll, pll
        """
        if not moves:
            return [
                {
                    "step_number": 0,
                    "step_name": "Solved",
                    "moves": [],
                    "description": "The cube is already solved!",
                }
            ]

        if method == "cfop":
            return self._split_cfop(moves)
        else:
            return self._split_beginner(moves)

    def _split_beginner(self, moves: list[str]) -> list[dict]:
        """Split into beginner method stages: 3 layers."""
        total = len(moves)

        if total <= 3:
            return [
                {
                    "step_number": 0,
                    "step_name": "Final Moves",
                    "moves": moves,
                    "description": "Just a few moves to solve the cube.",
                }
            ]

        # Rough heuristic split: ~40% layer 1, ~30% layer 2, ~30% layer 3
        cut1 = max(1, int(total * 0.4))
        cut2 = max(cut1 + 1, int(total * 0.7))

        return [
            {
                "step_number": 0,
                "step_name": "First Layer",
                "moves": moves[:cut1],
                "description": (
                    "Solve the white cross and first layer corners. "
                    "Focus on getting all white edge pieces aligned with their center colors."
                ),
            },
            {
                "step_number": 1,
                "step_name": "Second Layer",
                "moves": moves[cut1:cut2],
                "description": (
                    "Insert the middle layer edge pieces. "
                    "Look for edge pieces in the top layer that don't have yellow on them."
                ),
            },
            {
                "step_number": 2,
                "step_name": "Last Layer",
                "moves": moves[cut2:],
                "description": (
                    "Orient and permute the last layer. "
                    "First make a yellow cross, then position all corners and edges."
                ),
            },
        ]

    def _split_cfop(self, moves: list[str]) -> list[dict]:
        """Split into CFOP stages: cross, F2L, OLL, PLL."""
        total = len(moves)

        if total <= 4:
            return [
                {
                    "step_number": 0,
                    "step_name": "Final Moves",
                    "moves": moves,
                    "description": "Just a few moves to finish.",
                }
            ]

        # Heuristic split: ~15% cross, ~45% F2L, ~25% OLL, ~15% PLL
        c1 = max(1, int(total * 0.15))
        c2 = max(c1 + 1, int(total * 0.60))
        c3 = max(c2 + 1, int(total * 0.85))

        return [
            {
                "step_number": 0,
                "step_name": "Cross",
                "moves": moves[:c1],
                "description": (
                    "Build the white cross on the bottom. "
                    "Each edge must match its center color on the side."
                ),
            },
            {
                "step_number": 1,
                "step_name": "F2L (First Two Layers)",
                "moves": moves[c1:c2],
                "description": (
                    "Pair up corners and edges, then insert them into their slots. "
                    "Work on one pair at a time without disturbing solved pairs."
                ),
            },
            {
                "step_number": 2,
                "step_name": "OLL (Orient Last Layer)",
                "moves": moves[c2:c3],
                "description": (
                    "Orient all last layer pieces so the top face is all yellow. "
                    "Identify the OLL case and apply the correct algorithm."
                ),
            },
            {
                "step_number": 3,
                "step_name": "PLL (Permute Last Layer)",
                "moves": moves[c3:],
                "description": (
                    "Permute the last layer pieces into their correct positions. "
                    "Identify the PLL case and apply the algorithm to finish the solve."
                ),
            },
        ]

    def _mock_solution(self) -> list[str]:
        """Return a realistic mock solution for development without kociemba."""
        return [
            "R", "U", "R'", "U'",
            "F", "R", "U", "R'", "U'", "F'",
            "R", "U2", "R'", "U'", "R", "U'", "R'",
            "U", "R", "U", "R'", "U", "R", "U2", "R'",
        ]


# Module-level singleton
solver = CubeSolver()