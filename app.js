/* ── Streakr — app.js ── */
const TOKEN = 'streakr_v1';

const QUOTES = [
  "Small steps every day.",
  "Discipline is freedom.",
  "Progress, not perfection.",
  "You become what you repeat.",
  "One day at a time."
];

const CAT_LABELS = { health:'🏃 Health', mind:'🧠 Mind', work:'💼 Work', social:'🤝 Social', creative:'🎨 Creative', other:'✦ Other' };

/* ── State ── */
let habits = [];
let editingId = null;
let selectedColor = '#6C63FF';
let selectedFreq = 7;
let currentView = 'today';

function load() {
  try { habits = JSON.parse(localStorage.getItem(TOKEN)) || []; } catch { habits = []; }
}
function save() { localStorage.setItem(TOKEN, JSON.stringify(habits)); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function todayStr() { return new Date().toISOString().slice(0,10); }

function weekDates() {
  const today = new Date();
  return Array.from({length:7}, (_,i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0,10);
  });
}

function getStreak(habit) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0,10);
    if (habit.log[key]) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function getDoneToday(habit) { return !!habit.log[todayStr()]; }

/* ── Render Today ── */
function renderToday() {
  const list = document.getElementById('todayList');
  const empty = document.getElementById('emptyToday');
  list.innerHTML = '';
  if (habits.length === 0) { list.appendChild(empty); updateRing(); return; }
  if (empty.parentNode) empty.remove();
  habits.forEach(h => list.appendChild(buildCard(h, true)));
  updateRing();
}

/* ── Render All ── */
function renderAll() {
  const list = document.getElementById('allList');
  list.innerHTML = '';
  if (!habits.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">◎</div><p>No habits yet.</p></div>`;
    return;
  }
  habits.forEach(h => list.appendChild(buildCard(h, false)));
}

/* ── Build Card ── */
function buildCard(habit, showCheck) {
  const card = document.createElement('div');
  card.className = 'habit-card' + (getDoneToday(habit) ? ' done' : '');
  card.style.setProperty('--card-color', habit.color);

  const week = weekDates();
  const dotsHtml = week.map((d,i) => {
    const filled = !!habit.log[d];
    const isToday = d === todayStr();
    return `<div class="dot${filled?' filled':''}${isToday?' today-dot':''}"></div>`;
  }).join('');

  const streak = getStreak(habit);

  card.innerHTML = `
    <div class="habit-top">
      <span class="habit-cat">${CAT_LABELS[habit.category] || habit.category}</span>
      ${showCheck ? `<button class="habit-check" data-id="${habit.id}" title="Mark done">${getDoneToday(habit)?'✓':''}</button>` : ''}
    </div>
    <div class="habit-name">${habit.name}</div>
    <div class="habit-meta">
      <div class="streak-badge"><span class="streak-fire">🔥</span>${streak} day streak</div>
      <div class="week-dots">${dotsHtml}</div>
    </div>
  `;

  // Check button
  if (showCheck) {
    card.querySelector('.habit-check').addEventListener('click', e => {
      e.stopPropagation();
      toggleToday(habit.id);
    });
  }

  // Edit on card click
  card.addEventListener('click', () => openModal(habit.id));
  return card;
}

/* ── Toggle Today ── */
function toggleToday(id) {
  const h = habits.find(x => x.id === id);
  if (!h) return;
  const t = todayStr();
  if (h.log[t]) delete h.log[t];
  else h.log[t] = 1;
  save();
  renderView();
}

/* ── Ring ── */
function updateRing() {
  const total = habits.length;
  const done = habits.filter(getDoneToday).length;
  const pct = total ? Math.round((done/total)*100) : 0;
  const circ = 125.6;
  document.getElementById('ringFill').style.strokeDashoffset = circ - (circ * pct / 100);
  document.getElementById('ringLabel').textContent = pct + '%';
}

/* ── Stats ── */
function renderStats() {
  const grid = document.getElementById('statsGrid');
  grid.innerHTML = '';

  const totalHabits = habits.length;
  const totalDays = habits.reduce((s,h) => s + Object.keys(h.log).length, 0);
  const bestStreak = habits.reduce((best,h) => Math.max(best, getStreak(h)), 0);
  const todayDone = habits.filter(getDoneToday).length;

  const cards = [
    { label: 'Total Habits', value: totalHabits, sub: 'being tracked' },
    { label: 'Completed Today', value: `${todayDone}/${totalHabits}`, sub: 'of today\'s habits' },
    { label: 'Best Streak', value: bestStreak, sub: 'consecutive days' },
    { label: 'Total Check-ins', value: totalDays, sub: 'all time' },
  ];

  cards.forEach(c => {
    const el = document.createElement('div');
    el.className = 'stat-card';
    el.innerHTML = `<h3>${c.label}</h3><div class="stat-value">${c.value}</div><div class="stat-sub">${c.sub}</div>`;
    grid.appendChild(el);
  });

  // Heatmap (last 70 days)
  const hm = document.createElement('div');
  hm.className = 'stat-card full';
  hm.innerHTML = `<h3>Activity — last 70 days</h3><div class="heatmap" id="heatmap"></div>`;
  grid.appendChild(hm);

  const heatmap = hm.querySelector('#heatmap');
  const today = new Date();
  for (let i = 69; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const count = habits.filter(h => h.log[key]).length;
    const lvl = count === 0 ? '' : count <= 1 ? 'l1' : count <= 2 ? 'l2' : count <= 3 ? 'l3' : 'l4';
    const cell = document.createElement('div');
    cell.className = 'hm-cell ' + lvl;
    cell.title = `${key}: ${count} habit${count!==1?'s':''}`;
    heatmap.appendChild(cell);
  }
}

/* ── Modal ── */
function openModal(id = null) {
  editingId = id;
  const modal = document.getElementById('modalOverlay');
  const habit = id ? habits.find(h => h.id === id) : null;

  document.getElementById('modalTitle').textContent = habit ? 'Edit Habit' : 'New Habit';
  document.getElementById('habitName').value = habit ? habit.name : '';
  document.getElementById('habitCategory').value = habit ? habit.category : 'health';
  document.getElementById('btnDelete').style.display = habit ? 'block' : 'none';

  selectedColor = habit ? habit.color : '#6C63FF';
  selectedFreq = habit ? habit.freq : 7;

  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.color === selectedColor);
  });
  document.querySelectorAll('.freq-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.val === selectedFreq);
  });

  modal.classList.add('open');
  document.getElementById('habitName').focus();
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  editingId = null;
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) { document.getElementById('habitName').focus(); return; }
  const category = document.getElementById('habitCategory').value;

  if (editingId) {
    const h = habits.find(x => x.id === editingId);
    if (h) { h.name = name; h.category = category; h.color = selectedColor; h.freq = selectedFreq; }
  } else {
    habits.push({ id: uid(), name, category, color: selectedColor, freq: selectedFreq, log: {}, created: todayStr() });
  }
  save(); closeModal(); renderView();
}

function deleteHabit() {
  if (!editingId) return;
  if (!confirm('Delete this habit?')) return;
  habits = habits.filter(h => h.id !== editingId);
  save(); closeModal(); renderView();
}

/* ── Navigation ── */
function setView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');

  const titles = { today: ['Today', new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})], all: ['All Habits', `${habits.length} tracked`], stats: ['Statistics', 'Your progress'] };
  document.getElementById('pageTitle').textContent = titles[view][0];
  document.getElementById('pageSubtitle').textContent = titles[view][1];
  renderView();
}

function renderView() {
  if (currentView === 'today') renderToday();
  else if (currentView === 'all') renderAll();
  else renderStats();
}

/* ── Init ── */
function init() {
  load();

  // Quote
  document.getElementById('quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // Nav
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

  // Add btn
  document.getElementById('btnAdd').addEventListener('click', () => openModal());

  // Modal controls
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById('btnSave').addEventListener('click', saveHabit);
  document.getElementById('btnDelete').addEventListener('click', deleteHabit);

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(s => s.addEventListener('click', () => {
    selectedColor = s.dataset.color;
    document.querySelectorAll('.color-swatch').forEach(x => x.classList.toggle('active', x === s));
  }));

  // Freq buttons
  document.querySelectorAll('.freq-btn').forEach(b => b.addEventListener('click', () => {
    selectedFreq = +b.dataset.val;
    document.querySelectorAll('.freq-btn').forEach(x => x.classList.toggle('active', x === b));
  }));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('modalOverlay').classList.contains('open')) saveHabit();
  });

  setView('today');
}

document.addEventListener('DOMContentLoaded', init);
