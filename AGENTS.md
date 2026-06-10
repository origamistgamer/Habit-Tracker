# Streakr — Agent Handoff Guide

## Project Overview

**Streakr** is a vanilla JS PWA habit tracker. All state lives in `localStorage` under `streakr_v3`. No backend, Python, or Node build step is required.

## Architecture

```text
index.html          Shell: sidebar, today/calendar/stats views, modal, bottom nav
app.js              All state/logic (habits, streaks, import/export, confetti)
style.css           Dark theme, responsive layout, drag handle, toast
manifest.json       PWA manifest
sw.js               Cache-first assets, network-first navigation
.specify/           GitHub Spec-Kit SDD workflow
.speckit/           Swecha compliance prompts and templates
```

## Data Model

```json
[{ "id":"abc","name":"Morning run","color":"#818cf8","emoji":"🏃","freq":7,"log":{"2026-06-10":1} }]
```

## Key Functions (`app.js`)

| Function | Purpose |
|----------|---------|
| `render()` | Dispatches to today / calendar / stats |
| `getStreak(h)` | Consecutive days backward |
| `getBestStreak(h)` | Longest historical run |
| `getWeekLog(h)` | Last 7 days for week pips |
| `toggleDay(id, date)` | Toggle completion + save |
| `exportHabits()` / `importHabits(file)` | JSON backup |
| `checkAndCelebrate()` | Confetti when all done |

## Agent Workflow

1. Read `README.md` and `.speckit/CHEATSHEET.md` for Swecha compliance steps.
2. Load `.specify/memory/constitution.md` or `.speckit/constitution.md` before planning.
3. Keep diffs small; match existing code style.
4. Do not add Python or Node dependencies unless explicitly requested.

## Remaining Ideas

- Daily push notifications
- Week view toggle
- Habit archive (soft-delete)
- Notes per check-in
- `favicon.svg`
