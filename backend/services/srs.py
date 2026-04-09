"""SM-2 spaced repetition algorithm for algorithm mastery tracking."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone


def calculate_next_review(
    ease_factor: float,
    interval: int,
    repetitions: int,
    quality: int,
) -> dict[str, float | int | datetime]:
    """
    Calculate the next review parameters using the SM-2 algorithm.

    Args:
        ease_factor: Current ease factor (≥ 1.3)
        interval: Current interval in days
        repetitions: Number of successful repetitions in a row
        quality: Review quality rating (0-5)
            0-2 = failed (reset)
            3   = passed with difficulty
            4   = passed with some hesitation
            5   = perfect recall

    Returns:
        Dictionary with updated ease_factor, interval_days, repetitions, next_review.
    """
    if quality < 0 or quality > 5:
        raise ValueError(f"Quality must be 0-5, got {quality}")

    # Failed: reset repetitions and interval
    if quality < 3:
        new_repetitions = 0
        new_interval = 1
        new_ease = max(1.3, ease_factor - 0.2)
    else:
        # Passed: advance the schedule
        new_repetitions = repetitions + 1

        if new_repetitions == 1:
            new_interval = 1
        elif new_repetitions == 2:
            new_interval = 6
        else:
            new_interval = max(1, round(interval * ease_factor))

        # Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        new_ease = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        new_ease = max(1.3, new_ease)

    next_review = datetime.now(timezone.utc) + timedelta(days=new_interval)

    return {
        "ease_factor": round(new_ease, 4),
        "interval_days": new_interval,
        "repetitions": new_repetitions,
        "next_review": next_review,
    }