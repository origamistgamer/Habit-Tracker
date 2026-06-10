# Streakr Constitution

## Core Principles

### I. Simplicity First

Streakr is a vanilla HTML, CSS, and JavaScript habit tracker. Prefer zero-build-step solutions, browser APIs, and `localStorage` over frameworks unless a clear need is documented in a spec.

### II. Offline-First

The app MUST work offline via PWA (`manifest.json`, `sw.js`) and persist habits under the `streakr_v3` storage key. Network calls are optional enhancements, never required for core flows.

### III. Test Coverage (NON-NEGOTIABLE)

Pure logic (date formatting, streak calculation, backup schema validation) MUST have automated tests. CI runs `pytest --cov` on every push; coverage must not regress without justification.

### IV. Small, Focused Changes

Each change addresses one concern. Avoid drive-by refactors. Match existing naming and style in `app.js`, `style.css`, and `index.html`.

### V. AGPLv3 Compliance

The project remains licensed under AGPLv3. Third-party assets (fonts, CDNs) must be documented. Do not add proprietary or incompatible dependencies without an explicit amendment.

## Technical Constraints

- **Stack**: Vanilla JS, CSS, HTML; SortableJS and canvas-confetti via CDN only.
- **Data model**: `[{ id, name, color, emoji, freq, log: { "YYYY-MM-DD": 1 } }]`
- **Views**: Today, Calendar, Stats — keep navigation consistent across sidebar (desktop) and bottom nav (mobile).

## Development Workflow

1. Update or create specs under `specs/` when adding non-trivial features.
2. Run `pytest --cov=streakr` locally before pushing.
3. Pre-commit hooks and GitLab CI must pass.
4. Export/import JSON backups must remain backward-compatible with `streakr_v3`.

## Governance

This constitution supersedes ad-hoc decisions. Amendments require updating this file and noting the version below. All PRs should verify alignment with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-06-10 | **Last Amended**: 2026-06-10
