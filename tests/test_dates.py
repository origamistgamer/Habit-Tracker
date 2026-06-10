from datetime import date

from streakr.dates import fmt_date, get_best_streak, get_streak


def test_fmt_date():
    assert fmt_date(date(2026, 6, 10)) == "2026-06-10"


def test_get_streak_includes_today():
    habit = {"log": {"2026-06-08": 1, "2026-06-09": 1, "2026-06-10": 1}}
    assert get_streak(habit, today=date(2026, 6, 10)) == 3


def test_get_streak_starts_yesterday_if_today_missing():
    habit = {"log": {"2026-06-08": 1, "2026-06-09": 1}}
    assert get_streak(habit, today=date(2026, 6, 10)) == 2


def test_get_best_streak_with_gap():
    habit = {
        "log": {
            "2026-06-01": 1,
            "2026-06-02": 1,
            "2026-06-03": 1,
            "2026-06-10": 1,
            "2026-06-11": 1,
        }
    }
    assert get_best_streak(habit) == 3
