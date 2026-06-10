# AgentHandoff.md — Streakr v2

## Repo
https://github.com/origamistgamer/Habit-Tracker  
Branch: `main` | Owner: `origamistgamer`

## Stack
Vanilla HTML + CSS + JS. No frameworks, no build tools. `localStorage` for persistence. Google Fonts: DM Sans + DM Mono.

## Design Language
Inspired by everyday.app — ultra-minimal dark UI (`#0a0a0a` bg), calendar grid as the hero, habits as rows, colored dots per day. Right sidebar for summary stats. Monospace accents (DM Mono) for numbers/labels.

## Files
| File | Role |
|------|------|
| `index.html` | Shell: topbar, grid (header + rows), summary panel, modal |
| `style.css` | Full token system, grid layout, dot styles, modal |
| `app.js` | All state/logic |

## Data Model (`localStorage` key: `streakr_v2`)
```json
[
  {
    "id": "abc123",
    "name": "Morning run",
    "color": "#A78BFA",
    "log": { "2026-06-10": 1, "2026-06-09": 1 }
  }
]
```

## Key State
```js
state = { habits: [], year: 2026, month: 5 } // month 0-indexed
```

## Key Functions
- `render()` — full re-render (header + grid + summary)
- `renderGrid()` — builds day-number header + habit rows with dot buttons
- `renderSummary()` — updates today count, best streak, month %, legend
- `getStreak(habit)` — counts consecutive days backward
- `openModal(id)` — null = new habit, id = edit
- `prevMonth()` / `nextMonth()` — navigate calendar

## What's Working
- Full monthly calendar grid view with colored dot per completed day
- Navigate months (prev/next/today)
- Add, edit, delete habits
- Click any past/today dot to toggle completion
- Right panel: today's count, best streak, month %, habit legend
- Keyboard: Enter = save, Esc = close modal

## Next Steps (priority order)
1. **Habit reorder** — drag to reorder rows (use SortableJS CDN)
2. **PWA** — add `manifest.json` + service worker for offline + install
3. **Notifications** — daily reminder via Web Notifications API with user-set time
4. **Week view** — toggle between month and 7-day view
5. **Import/export** — JSON backup download/restore
6. **Habit archive** — soft-delete instead of permanent
7. **Notes on check-in** — optional note per dot (click-hold or right-click)
8. **Mobile sidebar** — swipe-up sheet for summary panel on small screens
9. **Favicon** — add `favicon.svg` using the brand dot

## GitHub Push Snippet
```python
from github import Github, Auth
g = Github(auth=Auth.Token('TOKEN'))
repo = g.get_user().get_repo('Habit-Tracker')
ex = repo.get_contents('filename')
repo.update_file('filename', 'commit msg', open('filename').read(), ex.sha)
```

*Handoff generated — June 10, 2026*
