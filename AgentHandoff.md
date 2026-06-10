# AgentHandoff.md — Streakr v3

## Repo
https://github.com/origamistgamer/Habit-Tracker | Branch: `main` | Owner: `origamistgamer`

## Stack
Vanilla HTML + CSS + JS. No frameworks/build tools. `localStorage` key: `streakr_v3`. Google Fonts: Inter + Space Grotesk.

## Design
- Dark (`#0c0c0e`) with indigo/purple gradient accent (`#818cf8 → #c084fc`)
- Sidebar navigation (Today / Calendar / Stats)
- Today view: card grid with emoji icons, check circles, streak pills, week pips
- Calendar view: monthly grid, colored dots per completion, month navigation
- Stats view: 4 summary tiles + per-habit progress bars + 84-day heatmap
- Modal: emoji picker, color swatches, frequency pills, gradient save btn

## Data Model (`streakr_v3`)
```json
[{ "id":"abc","name":"Morning run","color":"#818cf8","emoji":"🏃","freq":7,"log":{"2026-06-10":1} }]
```

## Key Functions (app.js)
- `render()` → dispatches to `renderToday()`, `renderGrid()`, `renderStats()`
- `getStreak(h)` → consecutive days backward
- `getWeekLog(h)` → last 7 days for week pips
- `toggleDay(id, date)` → toggle + save + re-render
- `openModal(id)` → null=new, id=edit
- `setView(v)` → switches views

## Working Features
- Today view: card grid, check off habits, streak counter, 7-day pips, completion ring
- Calendar: full month grid, click any dot to toggle, month nav
- Stats: summary tiles, per-habit 30-day %, heatmap
- Add/edit/delete habits with emoji, color, name, frequency
- Keyboard: Enter=save, Esc=close

## Next Steps
1. Drag-to-reorder habits (SortableJS CDN)
2. PWA — manifest.json + service worker
3. Daily push notifications
4. Week view toggle
5. Import/export JSON
6. Notes per check-in (long press / right click)
7. Habit archive (soft delete)
8. Mobile bottom nav (sidebar hidden on mobile)
9. Confetti animation on 100% completion

## Push Snippet
```python
from github import Github, Auth
g = Github(auth=Auth.Token('TOKEN'))
repo = g.get_user().get_repo('Habit-Tracker')
ex = repo.get_contents('file.ext')
repo.update_file('file.ext', 'msg', open('file.ext').read(), ex.sha)
```
*Handoff — Streakr v3 — June 10, 2026*
