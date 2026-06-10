from streakr.schema import validate_habits_backup


def test_valid_backup():
    data = [
        {
            "id": "abc",
            "name": "Morning run",
            "color": "#818cf8",
            "emoji": "🏃",
            "freq": 7,
            "log": {"2026-06-10": 1},
        }
    ]
    assert validate_habits_backup(data) == []


def test_rejects_non_array_root():
    assert "root must be a JSON array" in validate_habits_backup({})


def test_rejects_bad_date_key():
    data = [
        {
            "id": "x",
            "name": "Read",
            "color": "#fff",
            "emoji": "📚",
            "freq": 3,
            "log": {"06-10-2026": 1},
        }
    ]
    errors = validate_habits_backup(data)
    assert any("YYYY-MM-DD" in e for e in errors)
