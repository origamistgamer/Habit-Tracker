# Streakr — Habit Tracker

Streakr is a privacy-friendly, offline-capable habit tracker built with vanilla HTML, CSS, and JavaScript. Track daily habits, view streaks on a calendar, and export your data as JSON — no account required.

## Features

- **Today view** — card grid with check-offs, streak counters, and 7-day completion pips
- **Calendar** — monthly grid with colored dots; click to toggle any day
- **Stats** — summary tiles, per-habit 30-day progress, and 84-day heatmap
- **Habit editor** — emoji, color, name, and weekly frequency targets
- **Drag-to-reorder** habits (SortableJS)
- **Confetti** when all habits are completed for the day
- **Import / Export** JSON backups
- **PWA** — installable with offline caching via service worker

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | HTML5, CSS3, Vanilla JS |
| Storage | `localStorage` (`streakr_v3`) |
| PWA | `manifest.json`, `sw.js` |
| CDNs | SortableJS, canvas-confetti |

## Getting Started

Open `index.html` in a browser, or serve the folder with any static file server (Live Server, `npx serve`, etc.).

## Project Structure

```text
index.html          App shell (sidebar, views, modal)
app.js              State, rendering, habit logic
style.css           Design system
manifest.json       PWA manifest
sw.js               Service worker
.specify/           GitHub Spec-Kit (SDD workflow)
.speckit/           Swecha Spec-Kit templates & prompts
```

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
