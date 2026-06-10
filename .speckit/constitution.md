# Streakr Constitution

**ATTENTION ALL AGENTS AND CONTRIBUTORS:** This document is the source of truth for Streakr development mandates.

## 1. Simplicity & Vanilla Stack

- Streakr uses vanilla HTML, CSS, and JavaScript only — no frameworks or build steps unless a spec explicitly justifies them.
- Prefer `localStorage` and browser APIs over external services for core habit tracking.
- No Python backend and no Node/npm toolchain required to run the app.

## 2. Offline-First PWA

- The app MUST remain installable and usable offline via `manifest.json` and `sw.js`.
- Habit data persists under the `streakr_v3` storage key; backup import/export must stay backward-compatible.

## 3. Security & Privacy

- No secrets in the repository.
- Pre-commit and CI secret scanning (`gitleaks`) must pass on every push.

## 4. Agentic Guardrails

- STOP and ask before destructive operations (`rm -rf`, wiping user data schemas, force-pushing `main`).
- If a task conflicts with this constitution, halt and flag the conflict to the maintainer.

**Version**: 1.1.0 | **Ratified**: 2026-06-10
