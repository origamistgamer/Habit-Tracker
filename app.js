/* ── Streakr v2 ── */
const STORE = 'streakr_v2';

let state = { habits: [], year: 0, month: 0 }; // month: 0-indexed
let editingId = null;
let pickedColor = '#A78BFA';

/* ── Persist ── */
function load() {
  try { state.habits = JSON.parse(localStorage.getItem(STORE)) || []; } catch { state.habits = []; }
  const now = new Date();
  state.year = now.getFullYear();
  state.month = now.getMonth();
}
function save() { localStorage.setItem(STORE, JSON.stringify(state.habits)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function todayStr() { return fmtDate(new Date()); }
function fmtDate(d) { return d.toISOString().slice(0, 10); }

/* ── Date helpers ── */
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }

function monthDates(y, m) {
  const count = daysInMonth(y, m);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m, i + 1);
    return { date: fmtDate(d), day: i + 1, dow: d.getDay() };
  });
}

/* ── Streak ── */
function getStreak(habit) {
  let s = 0, d = new Date();
  // if not done today, start from yesterday
  if (!habit.log[todayStr()]) d.setDate(d.getDate() - 1);
  while (habit.log[fmtDate(d)]) { s++; d.setDate(d.getDate() - 1); }
  return s;
}

/* ── Render ── */
function render() {
  renderHeader();
  renderGrid();
  renderSummary();
}

function renderHeader() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('monthLabel').textContent = `${months[state.month]} ${state.year}`;
}

function renderGrid() {
  const dates = monthDates(state.year, state.month);
  const today = todayStr();

  // Day numbers header
  const daysRow = document.getElementById('daysRow');
  daysRow.innerHTML = '';
  dates.forEach(({ date, day, dow }) => {
    const el = document.createElement('div');
    el.className = 'day-num' + (date === today ? ' today' : '') + (dow === 0 ? ' sunday' : '');
    el.textContent = day;
    daysRow.appendChild(el);
  });

  // Habits body
  const body = document.getElementById('habitsBody');
  const empty = document.getElementById('emptyHint');
  body.innerHTML = '';

  if (!state.habits.length) {
    body.appendChild(empty);
    return;
  }

  state.habits.forEach(habit => {
    const row = document.createElement('div');
    row.className = 'habit-row';

    // Name cell
    const nameCell = document.createElement('div');
    nameCell.className = 'habit-name-cell';
    nameCell.title = 'Edit habit';
    nameCell.innerHTML = `
      <div class="habit-dot-label" style="background:${habit.color}"></div>
      <span class="habit-name-text">${habit.name}</span>
      <span class="habit-streak">${getStreak(habit) || ''}</span>
    `;
    nameCell.addEventListener('click', () => openModal(habit.id));
    row.appendChild(nameCell);

    // Dots
    const dotsRow = document.createElement('div');
    dotsRow.className = 'dots-row';

    dates.forEach(({ date, dow }) => {
      const isFuture = date > today;
      const isDone = !!habit.log[date];
      const isToday = date === today;

      const dot = document.createElement('button');
      dot.className = 'day-dot' +
        (isDone ? ' done' : '') +
        (isToday ? ' today-dot' : '') +
        (isFuture ? ' future' : '');

      if (isDone) {
        dot.style.background = habit.color;
        dot.style.opacity = '1';
      }

      if (!isFuture) {
        dot.addEventListener('click', () => {
          if (habit.log[date]) delete habit.log[date];
          else habit.log[date] = 1;
          save();
          render();
        });
      }

      dotsRow.appendChild(dot);
    });

    row.appendChild(dotsRow);
    body.appendChild(row);
  });
}

function renderSummary() {
  const today = todayStr();
  const total = state.habits.length;
  const doneToday = state.habits.filter(h => h.log[today]).length;
  const bestStreak = state.habits.reduce((b, h) => Math.max(b, getStreak(h)), 0);

  // Month completion %
  const dates = monthDates(state.year, state.month);
  const pastDates = dates.filter(d => d.date <= today);
  let possible = pastDates.length * total;
  let done = 0;
  if (possible > 0) {
    state.habits.forEach(h => {
      pastDates.forEach(d => { if (h.log[d.date]) done++; });
    });
  }
  const monthPct = possible ? Math.round((done / possible) * 100) : 0;

  document.getElementById('sumToday').textContent = `${doneToday} / ${total}`;
  document.getElementById('sumStreak').textContent = bestStreak;
  document.getElementById('sumMonth').textContent = `${monthPct}%`;

  // Legend
  const legend = document.getElementById('habitLegend');
  legend.innerHTML = '';
  state.habits.forEach(h => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-dot" style="background:${h.color}"></div><span class="legend-name">${h.name}</span>`;
    item.addEventListener('click', () => openModal(h.id));
    legend.appendChild(item);
  });
}

/* ── Modal ── */
function openModal(id = null) {
  editingId = id;
  const habit = id ? state.habits.find(h => h.id === id) : null;
  document.getElementById('modalHeading').textContent = habit ? 'edit habit' : 'new habit';
  document.getElementById('habitName').value = habit ? habit.name : '';
  document.getElementById('delBtn').style.display = habit ? 'inline-flex' : 'none';

  pickedColor = habit ? habit.color : '#A78BFA';
  document.querySelectorAll('.cswatch').forEach(s => {
    s.classList.toggle('active', s.dataset.c === pickedColor);
  });

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
    const h = state.habits.find(x => x.id === editingId);
    if (h) { h.name = name; h.color = pickedColor; }
  } else {
    state.habits.push({ id: uid(), name, color: pickedColor, log: {} });
  }
  save(); closeModal(); render();
}

function deleteHabit() {
  if (!editingId || !confirm('Delete this habit?')) return;
  state.habits = state.habits.filter(h => h.id !== editingId);
  save(); closeModal(); render();
}

/* ── Nav ── */
function prevMonth() {
  state.month--;
  if (state.month < 0) { state.month = 11; state.year--; }
  render();
}
function nextMonth() {
  state.month++;
  if (state.month > 11) { state.month = 0; state.year++; }
  render();
}

/* ── Boot ── */
function init() {
  load();

  document.getElementById('prevMonth').addEventListener('click', prevMonth);
  document.getElementById('nextMonth').addEventListener('click', nextMonth);
  document.getElementById('goToday').addEventListener('click', () => {
    const now = new Date();
    state.year = now.getFullYear();
    state.month = now.getMonth();
    render();
  });

  document.getElementById('openAdd').addEventListener('click', () => openModal());
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('saveBtn').addEventListener('click', saveHabit);
  document.getElementById('delBtn').addEventListener('click', deleteHabit);

  document.querySelectorAll('.cswatch').forEach(s => s.addEventListener('click', () => {
    pickedColor = s.dataset.c;
    document.querySelectorAll('.cswatch').forEach(x => x.classList.toggle('active', x === s));
  }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) saveHabit();
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
