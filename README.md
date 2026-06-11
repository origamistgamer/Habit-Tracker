# Streakr — Habit Tracker

Streakr is a privacy-friendly, offline-capable habit tracker built with vanilla HTML, CSS, and JavaScript. Track daily habits, view streaks on a calendar, and export your data as JSON — no account required.

Website Link:- https://habit-tracker2-xi.vercel.app/

## Features

- **Today view** — card grid with check-offs, streak counters, and 7-day completion pips
- **Calendar** — monthly or weekly grid with colored dots; click to toggle any day
- **Stats** — summary tiles, per-habit 30-day progress, and 84-day heatmap
- **Habit editor** — icon, color, and name
- **Drag-to-reorder** habits (SortableJS)
- **Confetti** when all habits are completed for the day
- **Import / Export** JSON backups
- **PWA** — installable with offline caching via service worker
- **i18n** — English, Hindi (हिन्दी), and Telugu (తెలుగు) language support; switchable in-app
- **Express server** (optional) — provides GET/PUT `/api/habits` for server-side sync

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | HTML5, CSS3, Vanilla JS |
| Storage | `localStorage` (`streakr_v3`) |
| i18n | Custom translation layer with 3 locales |
| PWA | `manifest.json`, `sw.js` |
| CDNs | SortableJS, canvas-confetti, Lucide icons |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser. The Express server serves the app and optional API. For static-only, open `index.html` directly.

## Project Structure

```text
index.html          App shell (sidebar, views, modal)
app.js              State, rendering, habit logic
translations.js     i18n data (English, Hindi, Telugu)
style.css           Design system
server.js           Optional Express backend (port 3000)
package.json        Dependencies & scripts
manifest.json       PWA manifest
sw.js               Service worker
.specify/           GitHub Spec-Kit (SDD workflow)
.speckit/           Swecha Spec-Kit templates & prompts
```

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
