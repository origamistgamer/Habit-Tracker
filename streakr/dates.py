"""Date and streak helpers aligned with app.js."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Mapping


def fmt_date(d: date) -> str:
    return f"{d.year}-{d.month:02d}-{d.day:02d}"


def get_streak(habit: Mapping[str, object], today: date | None = None) -> int:
    """Consecutive completed days ending today (or yesterday if today not done)."""
    log = habit.get("log") or {}
    if not isinstance(log, dict):
        return 0

    current = today or date.today()
    if not log.get(fmt_date(current)):
        current -= timedelta(days=1)

    streak = 0
    while log.get(fmt_date(current)):
        streak += 1
        current -= timedelta(days=1)
    return streak


def get_best_streak(habit: Mapping[str, object]) -> int:
    log = habit.get("log") or {}
    if not isinstance(log, dict):
        return 0

    dates = sorted(k for k, v in log.items() if v)
    if not dates:
        return 0

    max_streak = 0
    current_streak = 0
    prev: date | None = None

    for date_str in dates:
        y, m, d = (int(x) for x in date_str.split("-"))
        current = date(y, m, d)
        if prev is None:
            current_streak = 1
        else:
            diff = (current - prev).days
            if diff == 1:
                current_streak += 1
            elif diff > 1:
                max_streak = max(max_streak, current_streak)
                current_streak = 1
        prev = current

    return max(max_streak, current_streak)
