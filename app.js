/* ══════════════════════════════════
   Streakr v3 — app.js
══════════════════════════════════ */
const STORE = 'streakr_v3';

let habits = [];
let view = 'today';
let gridYear, gridMonth;
let editingId = null;
let pickedColor = '#818cf8';
let pickedEmoji = '🏃';
let pickedFreq = 7;

/* ── Storage ── */
function loadHabits() {
  try { habits = JSON.parse(localStorage.getItem(STORE)) || []; } catch { habits = []; }
}
function saveHabits() { localStorage.setItem(STORE, JSON.stringify(habits)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function todayStr() { return fmtDate(new Date()); }
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/* ── Streak ── */
function getStreak(h) {
  let s = 0, d = new Date();
  if (!h.log[todayStr()]) d.setDate(d.getDate()-1);
  while (h.log[fmtDate(d)]) { s++; d.setDate(d.getDate()-1); }
  return s;
}

/* ── Week pips (last 7 days incl today) ── */
function getWeekLog(h) {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    return { date: fmtDate(d), done: !!h.log[fmtDate(d)], isToday: i === 6 };
  });
}

/* ══════════════════════════════════
   RENDER DISPATCHER
══════════════════════════════════ */
function render() {
  if (view === 'today') renderToday();
  else if (view === 'grid') renderGrid();
  else renderStats();
}

/* ══════════════════════════════════
   TODAY VIEW
══════════════════════════════════ */
function renderToday() {
  const today = todayStr();
  const now = new Date();

  // Date label
  document.getElementById('todayDateLabel').textContent =
    now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  const container = document.getElementById('todayHabits');
  container.innerHTML = '';

  const emptyEl = document.getElementById('emptyToday');

  if (!habits.length) {
    container.appendChild(emptyEl);
    document.getElementById('todaySummary').style.display = 'none';
    updateRing(0, 0);
    return;
  }

  document.getElementById('todaySummary').style.display = 'flex';

  habits.forEach(h => {
    const done = !!h.log[today];
    const streak = getStreak(h);
    const week = getWeekLog(h);

    const card = document.createElement('div');
    card.className = 'habit-card' + (done ? ' done' : '');
    card.style.setProperty('--hc', h.color);

    const pipsHtml = week.map(w =>
      `<div class="week-pip${w.done?' lit':''}${w.isToday?' today-pip':''}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="card-top">
        <div class="card-emoji">${h.emoji}</div>
        <button class="check-circle" data-id="${h.id}">${done ? '✓' : ''}</button>
      </div>
      <div class="card-name">${h.name}</div>
      <div class="card-footer">
        <div class="streak-pill${streak >= 3 ? ' hot' : ''}">
          <span class="fire">🔥</span> ${streak} day${streak !== 1 ? 's' : ''}
        </div>
        <div class="week-track">${pipsHtml}</div>
      </div>
    `;

    card.querySelector('.check-circle').addEventListener('click', e => {
      e.stopPropagation();
      toggleDay(h.id, today);
    });
    card.addEventListener('click', () => openModal(h.id));
    container.appendChild(card);
  });

  // Summary
  const doneCount = habits.filter(h => !!h.log[today]).length;
  const leftCount = habits.length - doneCount;
  const bestStreak = habits.reduce((b,h) => Math.max(b, getStreak(h)), 0);
  document.getElementById('numDone').textContent = doneCount;
  document.getElementById('numLeft').textContent = leftCount;
  document.getElementById('numStreak').textContent = bestStreak;
  updateRing(doneCount, habits.length);
}

function updateRing(done, total) {
  const pct = total ? Math.round((done/total)*100) : 0;
  const circ = 163.4;
  document.getElementById('ringProgress').style.strokeDashoffset = circ - (circ * pct / 100);
  document.getElementById('ringPct').textContent = pct + '%';
}

function toggleDay(id, date) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  if (h.log[date]) delete h.log[date];
  else h.log[date] = 1;
  saveHabits(); render();
}

/* ══════════════════════════════════
   GRID VIEW
══════════════════════════════════ */
function daysInMonth(y,m) { return new Date(y, m+1, 0).getDate(); }

function renderGrid() {
  const today = todayStr();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('gridMonthTitle').textContent = `${months[gridMonth]} ${gridYear}`;

  const count = daysInMonth(gridYear, gridMonth);
  const dates = Array.from({length:count}, (_,i) => {
    const d = new Date(gridYear, gridMonth, i+1);
    return { str: fmtDate(d), day: i+1, dow: d.getDay() };
  });

  // Day headers
  const hdrs = document.getElementById('gridDayHeaders');
  hdrs.innerHTML = '';
  dates.forEach(({str, day, dow}) => {
    const el = document.createElement('div');
    el.className = 'grid-day-h' +
      (str === today ? ' is-today' : '') +
      (dow === 0 || dow === 6 ? ' is-weekend' : '');
    el.textContent = day;
    hdrs.appendChild(el);
  });

  // Labels
  const labels = document.getElementById('gridLabels');
  labels.innerHTML = '';
  habits.forEach(h => {
    const row = document.createElement('div');
    row.className = 'grid-label-row';
    row.innerHTML = `<span class="grid-label-emoji">${h.emoji}</span><span class="grid-label-text">${h.name}</span>`;
    row.style.height = '36px';
    row.addEventListener('click', () => openModal(h.id));
    labels.appendChild(row);
  });

  // Dot rows
  const rows = document.getElementById('gridRows');
  rows.innerHTML = '';
  habits.forEach(h => {
    const row = document.createElement('div');
    row.className = 'grid-habit-row';
    dates.forEach(({str}) => {
      const isFuture = str > today;
      const isDone = !!h.log[str];
      const isToday = str === today;
      const dot = document.createElement('div');
      dot.className = 'grid-dot' +
        (isDone ? ' gd-done' : '') +
        (isToday ? ' gd-today' : '') +
        (isFuture ? ' gd-future' : '');
      if (isDone) { dot.style.background = h.color; dot.style.opacity = '0.85'; }
      if (!isFuture) dot.addEventListener('click', () => toggleDay(h.id, str));
      row.appendChild(dot);
    });
    rows.appendChild(row);
  });

  if (!habits.length) {
    labels.innerHTML = '<div style="padding:20px 8px;color:var(--text3);font-size:13px;">No habits yet</div>';
  }
}

/* ══════════════════════════════════
   STATS VIEW
══════════════════════════════════ */
function renderStats() {
  const today = todayStr();
  const totalHabits = habits.length;
  const totalCheckins = habits.reduce((s,h) => s + Object.keys(h.log).length, 0);
  const doneToday = habits.filter(h => !!h.log[today]).length;
  const bestStreak = habits.reduce((b,h) => Math.max(b, getStreak(h)), 0);

  const content = document.getElementById('statsContent');
  content.innerHTML = '';

  // Top tiles
  const topRow = document.createElement('div');
  topRow.className = 'stats-top-row';
  [
    { label: 'Habits', val: totalHabits, sub: 'being tracked' },
    { label: 'Done Today', val: `${doneToday}/${totalHabits}`, sub: 'completed' },
    { label: 'Best Streak', val: bestStreak, sub: 'days in a row' },
    { label: 'Total', val: totalCheckins, sub: 'all-time check-ins' },
  ].forEach(t => {
    topRow.innerHTML += `
      <div class="stat-tile">
        <div class="stat-tile-label">${t.label}</div>
        <div class="stat-tile-val">${t.val}</div>
        <div class="stat-tile-sub">${t.sub}</div>
      </div>`;
  });
  content.appendChild(topRow);

  // Per-habit rows
  if (habits.length) {
    const listWrap = document.createElement('div');
    listWrap.className = 'stats-habit-list';
    habits.forEach(h => {
      const streak = getStreak(h);
      const total = Object.keys(h.log).length;
      // completion rate (last 30 days)
      let possible = 0, done = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(); d.setDate(d.getDate()-i);
        if (fmtDate(d) <= today) { possible++; if (h.log[fmtDate(d)]) done++; }
      }
      const pct = possible ? Math.round((done/possible)*100) : 0;
      const row = document.createElement('div');
      row.className = 'stats-habit-row';
      row.innerHTML = `
        <div class="shr-emoji">${h.emoji}</div>
        <div class="shr-info">
          <div class="shr-name">${h.name}</div>
          <div class="shr-bar-wrap">
            <div class="shr-bar" style="width:${pct}%;background:${h.color}"></div>
          </div>
        </div>
        <div class="shr-nums">
          <div class="shr-streak" style="color:${h.color}">${streak}🔥</div>
          <div class="shr-days">${pct}% / 30d</div>
        </div>
      `;
      row.addEventListener('click', () => openModal(h.id));
      listWrap.appendChild(row);
    });
    content.appendChild(listWrap);
  }

  // Heatmap
  const hmSection = document.createElement('div');
  hmSection.className = 'heatmap-section';
  hmSection.innerHTML = `<div class="heatmap-title">Activity — last 84 days</div><div class="heatmap-grid" id="hmGrid"></div>`;
  content.appendChild(hmSection);
  setTimeout(() => {
    const grid = document.getElementById('hmGrid');
    if (!grid) return;
    for (let i = 83; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = fmtDate(d);
      const count = habits.filter(h => h.log[key]).length;
      const lvl = count === 0 ? '' : count === 1 ? 'l1' : count === 2 ? 'l2' : count <= 3 ? 'l3' : 'l4';
      const cell = document.createElement('div');
      cell.className = 'hm-cell ' + lvl;
      cell.title = `${key}: ${count} habit${count!==1?'s':''}`;
      grid.appendChild(cell);
    }
  }, 0);
}

/* ══════════════════════════════════
   MODAL
══════════════════════════════════ */
function openModal(id = null) {
  editingId = id;
  const h = id ? habits.find(x => x.id === id) : null;
  document.getElementById('modalTitle').textContent = h ? 'Edit Habit' : 'New Habit';
  document.getElementById('habitName').value = h ? h.name : '';
  document.getElementById('delBtn').style.display = h ? 'inline-flex' : 'none';

  pickedColor = h ? h.color : '#818cf8';
  pickedEmoji = h ? h.emoji : '🏃';
  pickedFreq  = h ? (h.freq || 7) : 7;

  document.querySelectorAll('.cswatch').forEach(s => s.classList.toggle('active', s.dataset.c === pickedColor));
  document.querySelectorAll('.emoji-btn').forEach(b => b.classList.toggle('active', b.dataset.e === pickedEmoji));
  document.querySelectorAll('.freq-pill').forEach(p => p.classList.toggle('active', +p.dataset.f === pickedFreq));

  document.getElementById('overlay').classList.add('open');
  setTimeout(() => document.getElementById('habitName').focus(), 50);
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) { document.getElementById('habitName').focus(); return; }
  if (editingId) {
    const h = habits.find(x => x.id === editingId);
    if (h) { h.name = name; h.color = pickedColor; h.emoji = pickedEmoji; h.freq = pickedFreq; }
  } else {
    habits.push({ id: uid(), name, color: pickedColor, emoji: pickedEmoji, freq: pickedFreq, log: {} });
  }
  saveHabits(); closeModal(); render();
}

function deleteHabit() {
  if (!editingId || !confirm('Delete this habit and all its data?')) return;
  habits = habits.filter(h => h.id !== editingId);
  saveHabits(); closeModal(); render();
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
function setView(v) {
  view = v;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  render();
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
function init() {
  loadHabits();
  const now = new Date();
  gridYear = now.getFullYear();
  gridMonth = now.getMonth();

  // Inject SVG gradient defs
  document.body.insertAdjacentHTML('beforeend', `
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8"/>
          <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
      </defs>
    </svg>`);

  // Nav
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => setView(b.dataset.view)));

  // Add btn
  document.getElementById('openAdd').addEventListener('click', () => openModal());

  // Month nav
  document.getElementById('prevMonth').addEventListener('click', () => {
    gridMonth--; if (gridMonth < 0) { gridMonth = 11; gridYear--; } render();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    gridMonth++; if (gridMonth > 11) { gridMonth = 0; gridYear++; } render();
  });
  document.getElementById('goToday').addEventListener('click', () => {
    const n = new Date(); gridYear = n.getFullYear(); gridMonth = n.getMonth(); render();
  });

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('saveBtn').addEventListener('click', saveHabit);
  document.getElementById('delBtn').addEventListener('click', deleteHabit);

  document.querySelectorAll('.cswatch').forEach(s => s.addEventListener('click', () => {
    pickedColor = s.dataset.c;
    document.querySelectorAll('.cswatch').forEach(x => x.classList.toggle('active', x === s));
  }));
  document.querySelectorAll('.emoji-btn').forEach(b => b.addEventListener('click', () => {
    pickedEmoji = b.dataset.e;
    document.querySelectorAll('.emoji-btn').forEach(x => x.classList.toggle('active', x === b));
  }));
  document.querySelectorAll('.freq-pill').forEach(p => p.addEventListener('click', () => {
    pickedFreq = +p.dataset.f;
    document.querySelectorAll('.freq-pill').forEach(x => x.classList.toggle('active', x === p));
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) saveHabit();
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
