"""Validate Streakr JSON backup payloads."""

from __future__ import annotations

import re

_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_REQUIRED_KEYS = frozenset({"id", "name", "color", "emoji", "freq", "log"})


def validate_habits_backup(data: object) -> list[str]:
    """Return a list of validation errors (empty if valid)."""
    errors: list[str] = []
    if not isinstance(data, list):
        return ["root must be a JSON array"]

    for i, habit in enumerate(data):
        prefix = f"habits[{i}]"
        if not isinstance(habit, dict):
            errors.append(f"{prefix} must be an object")
            continue

        missing = _REQUIRED_KEYS - habit.keys()
        if missing:
            errors.append(f"{prefix} missing keys: {', '.join(sorted(missing))}")
            continue

        if not isinstance(habit["name"], str) or not habit["name"].strip():
            errors.append(f"{prefix}.name must be a non-empty string")
        if not isinstance(habit["id"], str) or not habit["id"]:
            errors.append(f"{prefix}.id must be a non-empty string")
        if not isinstance(habit["freq"], int) or habit["freq"] < 1:
            errors.append(f"{prefix}.freq must be a positive integer")

        log = habit.get("log")
        if not isinstance(log, dict):
            errors.append(f"{prefix}.log must be an object")
            continue

        for day, value in log.items():
            if not _DATE_RE.match(day):
                errors.append(f"{prefix}.log key '{day}' must be YYYY-MM-DD")
            if value not in (0, 1, True, False):
                errors.append(f"{prefix}.log['{day}'] must be boolean or 0/1")

    return errors
