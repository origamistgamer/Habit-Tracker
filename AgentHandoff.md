# AgentHandoff.md — Streakr v4

## Repo
https://github.com/origamistgamer/Habit-Tracker | Branch: `main` | Owner: `origamistgamer`

## Stack
Vanilla HTML + CSS + JS. No frameworks/build tools. `localStorage` key: `streakr_v3`. Google Fonts: Inter + Space Grotesk.
CDNs: SortableJS 1.15.2, canvas-confetti 1.9.2.

## Design
- Dark (`#0c0c0e`) with indigo/purple gradient accent (`#818cf8 → #c084fc`)
- Sidebar navigation on desktop (Today / Calendar / Stats)
- Bottom tab bar on mobile (≤640px) with FAB add button
- Today view: card grid with drag handle, emoji icons, check circles, streak pills, week pips
- Calendar view: monthly grid, colored dots per completion, month navigation
- Stats view: 4 summary tiles + per-habit progress bars + 84-day heatmap + Import/Export buttons
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
- `setView(v)` → switches views, syncs sidebar + bottom nav
- `initSortable()` / `destroySortable()` → SortableJS on today-habits
- `fireConfetti()` → canvas-confetti burst in habit colors
- `checkAndCelebrate()` → fires confetti once when all today's habits done
- `exportHabits()` → download `streakr_backup_DATE.json`
- `importHabits(file)` → parse JSON, merge or replace habits
- `showToast(msg)` → temporary bottom notification

## Working Features
- Today view: card grid, check off habits, streak counter, 7-day pips, completion ring
- Calendar: full month grid, click any dot to toggle, month nav
- Stats: summary tiles, per-habit 30-day %, heatmap
- Add/edit/delete habits with emoji, color, name, frequency
- **Drag-to-reorder** habits (SortableJS, drag handle on hover)
- **Confetti** animation when all habits completed for today
- **Export JSON** backup download from Stats view
- **Import JSON** merge or replace from Stats view / mobile nav
- **Mobile bottom nav** with FAB add button (≤640px)
- **PWA**: manifest.json + service worker (sw.js) for offline
- Keyboard: Enter=save, Esc=close

## Files
| File | Role |
|------|------|
| `index.html` | Shell: sidebar, views, bottom nav, modal |
| `style.css` | Design system, drag handle, sortable states, bottom nav, toast |
| `app.js` | All state/logic |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (cache-first assets, network-first nav) |

## Remaining Next Steps
1. **Daily push notifications** — Web Notifications API with user-set time
2. **Week view** — toggle between month and 7-day view
3. **Habit archive** — soft-delete instead of permanent
4. **Notes per check-in** — optional note (long press / right click per dot)
5. **Favicon** — `favicon.svg` using brand "S" gradient mark

## Push Snippet
```python
from github import Github, Auth
g = Github(auth=Auth.Token('TOKEN'))
repo = g.get_user().get_repo('Habit-Tracker')
for fname in ['index.html','style.css','app.js','manifest.json','sw.js','AgentHandoff.md']:
    ex = repo.get_contents(fname)
    repo.update_file(fname, 'Streakr v4', open(fname).read(), ex.sha)
```
*Handoff — Streakr v4 — June 10, 2026*
