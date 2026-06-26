/* ══════════════════════════════════
   Streakr v4 — app.js
══════════════════════════════════ */
const STORE = 'streakr_v3';

const HABIT_ICONS = [
  { id: 'run', label: 'Run', emoji: '🏃', lucide: 'footprints', cat: 'fitness' },
  { id: 'cycle', label: 'Cycle', emoji: '🚴', lucide: 'bike', cat: 'fitness' },
  { id: 'swim', label: 'Swim', emoji: '🏊', lucide: 'waves', cat: 'fitness' },
  { id: 'gym', label: 'Gym', emoji: '🏋️', lucide: 'dumbbell', cat: 'fitness' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘', lucide: 'person-standing', cat: 'fitness' },
  { id: 'read', label: 'Read', emoji: '📚', lucide: 'book-open', cat: 'mind' },
  { id: 'meditate', label: 'Meditate', emoji: '🧠', lucide: 'brain', cat: 'mind' },
  { id: 'journal', label: 'Journal', emoji: '📓', lucide: 'notebook-pen', cat: 'mind' },
  { id: 'focus', label: 'Deep Work', emoji: '🎯', lucide: 'target', cat: 'mind' },
  { id: 'water', label: 'Water', emoji: '💧', lucide: 'droplets', cat: 'health' },
  { id: 'sleep', label: 'Sleep', emoji: '😴', lucide: 'moon', cat: 'health' },
  { id: 'diet', label: 'Diet', emoji: '🥗', lucide: 'salad', cat: 'health' },
  { id: 'noscreen', label: 'No Screens', emoji: '📵', lucide: 'monitor-off', cat: 'health' },
  { id: 'code', label: 'Code', emoji: '💻', lucide: 'code-2', cat: 'creative' },
  { id: 'music', label: 'Music', emoji: '🎵', lucide: 'music', cat: 'creative' },
  { id: 'draw', label: 'Draw', emoji: '🎨', lucide: 'pencil', cat: 'creative' },
  { id: 'write', label: 'Write', emoji: '✍️', lucide: 'pen-line', cat: 'creative' },
  { id: 'cook', label: 'Cook', emoji: '🍳', lucide: 'chef-hat', cat: 'life' },
  { id: 'clean', label: 'Clean', emoji: '🧹', lucide: 'brush', cat: 'life' },
  { id: 'outside', label: 'Go Outside', emoji: '🌿', lucide: 'tree-pine', cat: 'life' },
  { id: 'study', label: 'Study', emoji: '📝', lucide: 'library', cat: 'life' },
];

let habits = [];
let view = 'today';
let gridYear,
  gridMonth,
  gridMode = 'month',
  gridWeekStart;
let editingId = null;
let pickedColor = '#818cf8';
let pickedIcon = 'run';
let sortableInstance = null;
let lastAllDone = false; // prevent repeat confetti

// AI settings accessed via AI.getSettings()
let aiToastTimer = null;

/* ── i18n ── */
let currentLang = localStorage.getItem('streakr_lang') || 'en';

function t(key, vars = {}) {
  let str = translations[currentLang]?.[key] || translations.en?.[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), v);
  });
  return str;
}

function setLang(code) {
  currentLang = code;
  localStorage.setItem('streakr_lang', code);
  document.documentElement.lang = code;
  translatePage();
  render();
  if (view === 'grid') {
    renderGrid();
  }
  // Update lang switcher buttons
  document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('active', b.dataset.lang === code));
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-confirm]').forEach((el) => {
    const key = el.dataset.i18nConfirm;
    const orig = el.getAttribute('onclick') || '';
    if (orig.includes('confirm(')) {
      el.setAttribute('onclick', orig.replace(/confirm\('[^']*'\)/, `confirm('${t(key).replace(/'/g, "\\'")}')`));
    }
  });
}

function getLocale() {
  return LOCALE_MAP[currentLang] || 'en-US';
}

/* ── AI ── */
function initAISettingsPanel() {
  const overlay = document.getElementById('aiSettingsOverlay');
  const openBtn = document.getElementById('openAISettings');
  const closeBtn = document.getElementById('aiSettingsClose');

  openBtn?.addEventListener('click', () => {
    overlay.classList.add('open');
    loadSettingsIntoPanel();
  });
  closeBtn?.addEventListener('click', () => overlay.classList.remove('open'));
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });

  document.getElementById('aiEnabled')?.addEventListener('change', (e) => {
    const s = AI.getSettings();
    s.enabled = e.target.checked;
    AI.setSettings(s);
    updateProviderVisibility();
  });
  document.getElementById('aiProvider')?.addEventListener('change', (e) => {
    const s = AI.getSettings();
    s.provider = e.target.value;
    AI.setSettings(s);
    updateProviderVisibility();
  });
  document.getElementById('ollamaUrl')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.ollamaUrl = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('ollamaModel')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.ollamaModel = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('openaiKey')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.openaiKey = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('openaiModel')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.openaiModel = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('anthropicKey')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.anthropicKey = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('anthropicModel')?.addEventListener('input', (e) => {
    const s = AI.getSettings();
    s.anthropicModel = e.target.value;
    AI.setSettings(s);
  });
  document.getElementById('featureWeekly')?.addEventListener('change', (e) => {
    const s = AI.getSettings();
    s.features.weeklySummary = e.target.checked;
    AI.setSettings(s);
  });
  document.getElementById('featureStreak')?.addEventListener('change', (e) => {
    const s = AI.getSettings();
    s.features.streakMessages = e.target.checked;
    AI.setSettings(s);
  });
  document.getElementById('featureRecovery')?.addEventListener('change', (e) => {
    const s = AI.getSettings();
    s.features.recoveryAdvice = e.target.checked;
    AI.setSettings(s);
  });

  document.getElementById('testConnection')?.addEventListener('click', async () => {
    const btn = document.getElementById('testConnection');
    const result = document.getElementById('testResult');
    btn.disabled = true;
    btn.textContent = t('ai.testing');
    result.textContent = '';
    try {
      const ok = await AI.testConnection();
      result.textContent = ok ? t('ai.test_success') : t('ai.test_fail');
      result.style.color = ok ? '#34d399' : '#f87171';
    } catch {
      result.textContent = t('ai.test_fail');
      result.style.color = '#f87171';
    }
    btn.disabled = false;
    btn.textContent = t('ai.test');
  });
}

function loadSettingsIntoPanel() {
  const s = AI.getSettings();
  document.getElementById('aiEnabled').checked = s.enabled;
  document.getElementById('aiProvider').value = s.provider;
  document.getElementById('ollamaUrl').value = s.ollamaUrl;
  document.getElementById('ollamaModel').value = s.ollamaModel;
  document.getElementById('openaiKey').value = s.openaiKey;
  document.getElementById('openaiModel').value = s.openaiModel;
  document.getElementById('anthropicKey').value = s.anthropicKey;
  document.getElementById('anthropicModel').value = s.anthropicModel;
  document.getElementById('featureWeekly').checked = s.features.weeklySummary;
  document.getElementById('featureStreak').checked = s.features.streakMessages;
  document.getElementById('featureRecovery').checked = s.features.recoveryAdvice;
  updateProviderVisibility();
  document.getElementById('testResult').textContent = '';
}

function updateProviderVisibility() {
  const s = AI.getSettings();
  const prov = s.provider;
  document.getElementById('ollamaSettings').style.display = prov === 'ollama' ? 'block' : 'none';
  document.getElementById('openaiSettings').style.display = prov === 'openai' ? 'block' : 'none';
  document.getElementById('anthropicSettings').style.display = prov === 'anthropic' ? 'block' : 'none';
}

function showAIToast(html) {
  const toast = document.getElementById('aiToast');
  if (!toast) return;
  clearTimeout(aiToastTimer);
  toast.innerHTML = html;
  toast.classList.add('show');
  aiToastTimer = setTimeout(() => toast.classList.remove('show'), 8000);
}

function createAICard(titleKey, html) {
  return `<div class="ai-card"><strong>${t(titleKey)}</strong><div>${html}</div></div>`;
}

function createAILoading(titleKey) {
  return `<div class="ai-card"><strong>${t(titleKey)}</strong><div><span class="ai-spinner"></span>${t('ai.summary_loading')}</div></div>`;
}

function getIconData(h) {
  const icon = h.icon ? HABIT_ICONS.find((i) => i.id === h.icon) : null;
  return icon || { emoji: h.emoji || '🏃', lucide: null };
}

/* ── Storage ── */
async function loadHabits() {
  // localStorage is the primary store — preserves existing data
  try {
    habits = JSON.parse(localStorage.getItem(STORE)) || [];
  } catch {
    habits = [];
  }
  // Migrate old habits: convert string name to translation object
  let migrated = false;
  habits.forEach((h) => {
    if (h.name && typeof h.name === 'string') {
      h.name = { en: h.name, hi: '', te: '' };
      migrated = true;
    }
  });
  if (migrated) saveHabits();
  // Sync from server only if localStorage was empty (e.g. first time on a new device)
  if (!habits.length) {
    try {
      const res = await fetch('/api/habits');
      if (res.ok) {
        habits = await res.json();
        localStorage.setItem(STORE, JSON.stringify(habits));
      }
    } catch {}
  }
}
function saveHabits() {
  localStorage.setItem(STORE, JSON.stringify(habits));
  fetch('/api/habits', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(habits),
  }).catch(() => {});
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function todayStr() {
  return fmtDate(new Date());
}
function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ── Streak ── */
function getStreak(h) {
  let s = 0,
    d = new Date();
  if (!h.log[todayStr()]) d.setDate(d.getDate() - 1);
  while (h.log[fmtDate(d)]) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

function getBestStreak(h) {
  const dates = Object.keys(h.log)
    .filter((k) => h.log[k])
    .sort();
  if (dates.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate = null;

  for (const dateStr of dates) {
    const currentDate = new Date(dateStr + 'T00:00:00');
    if (prevDate === null) {
      currentStreak = 1;
    } else {
      const diffTime = currentDate - prevDate;
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        if (currentStreak > maxStreak) maxStreak = currentStreak;
        currentStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  if (currentStreak > maxStreak) maxStreak = currentStreak;
  return maxStreak;
}

/* ── Week pips (last 7 days incl today) ── */
function getWeekLog(h) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: fmtDate(d), done: !!h.log[fmtDate(d)], isToday: i === 6 };
  });
}

/* ── Streak at any given date (for grid intensity) ── */
function getStreakAtDate(h, dateStr) {
  let s = 0,
    d = new Date(dateStr + 'T00:00:00');
  while (h.log[fmtDate(d)]) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}

/* ── Consecutive missed days (backwards from yesterday) ── */
function getConsecutiveMissed(h) {
  let missed = 0,
    d = new Date();
  d.setDate(d.getDate() - 1);
  while (!h.log[fmtDate(d)] && missed < 365) {
    missed++;
    d.setDate(d.getDate() - 1);
  }
  return missed;
}

/* ══════════════════════════════════
   CONFETTI
══════════════════════════════════ */
function fireConfetti() {
  if (typeof confetti === 'undefined') return;
  const colors = habits.map((h) => h.color).filter(Boolean);
  const defaults = { spread: 80, ticks: 80, gravity: 0.9, decay: 0.92, startVelocity: 30 };

  function shoot(particleRatio, opts) {
    confetti(
      Object.assign({}, defaults, opts, {
        particleCount: Math.floor(150 * particleRatio),
        colors: colors.length ? colors : ['#818cf8', '#c084fc', '#34d399'],
      }),
    );
  }
  shoot(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.5, y: 0.8 } });
  shoot(0.2, { spread: 60, origin: { x: 0.5, y: 0.8 } });
  shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.5, y: 0.8 } });
  shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, origin: { x: 0.5, y: 0.8 } });
  shoot(0.1, { spread: 120, startVelocity: 45, origin: { x: 0.5, y: 0.8 } });
}

function checkAndCelebrate() {
  const today = todayStr();
  if (!habits.length) {
    lastAllDone = false;
    return;
  }
  const allDone = habits.every((h) => !!h.log[today]);
  if (allDone && !lastAllDone) {
    fireConfetti();
    lastAllDone = true;
    // AI streak message
    const s1 = AI.getSettings();
    if (s1.enabled && s1.features.streakMessages) {
      const bestStreak = habits.reduce((b, h) => Math.max(b, getStreak(h)), 0);
      AI.getStreakMessage(bestStreak, habits.length, currentLang)
        .then((msg) => {
          if (msg) showAIToast(createAICard('ai.streak_messages', msg));
        })
        .catch(() => {});
    }
  } else if (!allDone) {
    lastAllDone = false;
  }
}

/* ══════════════════════════════════
   RENDER DISPATCHER
══════════════════════════════════ */
function render() {
  if (view === 'today') renderToday();
  else if (view === 'grid') renderGrid();
  else if (view === 'stats') renderStats();
}

/* ══════════════════════════════════
   TODAY VIEW
══════════════════════════════════ */
function renderToday() {
  const today = todayStr();
  const now = new Date();

  document.getElementById('todayDateLabel').textContent = now.toLocaleDateString(getLocale(), {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const container = document.getElementById('todayHabits');
  container.innerHTML = '';

  if (!habits.length) {
    container.innerHTML = `<div class="empty-state" style="display:flex">
      <div class="empty-card">
        <div class="empty-graphic">
          <svg viewBox="0 0 80 80" width="80" height="80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>
            <circle cx="28" cy="30" r="12" stroke="#818cf8" stroke-width="2" opacity=".5"/>
            <circle cx="52" cy="30" r="12" stroke="#c084fc" stroke-width="2" opacity=".5"/>
            <circle cx="40" cy="50" r="14" stroke="#a78bfa" stroke-width="2" opacity=".8"/>
            <path d="M32 48l6 4 10-12" stroke="#818cf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>
          </svg>
        </div>
        <h3>${t('today.empty.title')}</h3>
        <p>${t('today.empty.body')}</p>
        <button class="cta-btn" onclick="document.getElementById('openAdd').click()">${t('today.empty.cta')}</button>
      </div>
    </div>`;
    document.getElementById('todaySummary').style.display = 'none';
    updateRing(0, 0);
    destroySortable();
    return;
  }

  document.getElementById('todaySummary').style.display = 'flex';

  habits.forEach((h) => {
    const done = !!h.log[today];
    const streak = getStreak(h);
    const week = getWeekLog(h);
    const missed = !done ? getConsecutiveMissed(h) : 0;
    const icon = getIconData(h);

    const card = document.createElement('div');
    card.className = 'habit-card' + (done ? ' done' : '');
    card.style.setProperty('--hc', h.color);
    card.dataset.id = h.id;

    const pipsHtml = week
      .map((w) => `<div class="week-pip${w.done ? ' lit' : ''}${w.isToday ? ' today-pip' : ''}"></div>`)
      .join('');

    const s2 = AI.getSettings();
    const recoveryHtml =
      missed >= 2 && s2.enabled && s2.features.recoveryAdvice
        ? `<div class="ai-recovery" data-habit="${h.id}" data-missed="${missed}">${createAILoading('ai.recovery_advice')}</div>`
        : '';

    card.innerHTML = `
      <div class="drag-handle" title="${t('today.drag_hint')}">⠿</div>
      <div class="card-top">
        <div class="card-icon-tile">${icon.lucide ? `<i data-lucide="${icon.lucide}" class="card-lucide-icon"></i>` : icon.emoji}</div>
        <button class="check-circle" data-id="${h.id}">${done ? '✓' : ''}</button>
      </div>
      <div class="card-name">${getHabitName(h)}</div>
      ${missed >= 2 ? `<div class="skip-warning">${t('today.skip_warning')}</div>` : ''}
      ${recoveryHtml}
      <div class="card-footer">
        <div class="streak-pill${streak >= 3 ? ' hot' : ''}">
          ${streak === 1 ? t('today.streak', { count: streak }) : t('today.streak_plural', { count: streak })}
        </div>
        <div class="week-track">${pipsHtml}</div>
      </div>
    `;

    card.querySelector('.check-circle').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDay(h.id, today);
    });
    card.addEventListener('click', (ev) => {
      if (ev.target.closest('.check-circle') || ev.target.closest('.drag-handle')) return;
      openModal(h.id);
    });
    container.appendChild(card);
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Load AI recovery advice for habits with missed days
  const s3 = AI.getSettings();
  if (s3.enabled && s3.features.recoveryAdvice) {
    container.querySelectorAll('.ai-recovery').forEach((el) => {
      const habitId = el.dataset.habit;
      const missed = parseInt(el.dataset.missed, 10);
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        const displayName = habit.name?.[currentLang] ? habit.name[currentLang] : habit.name;
        AI.getRecoveryAdvice(displayName, missed, currentLang)
          .then((msg) => {
            if (msg) el.innerHTML = createAICard('ai.recovery_advice', msg);
          })
          .catch(() => {
            el.innerHTML = '';
          });
      }
    });
  }

  const doneCount = habits.filter((h) => !!h.log[today]).length;
  const leftCount = habits.length - doneCount;
  const bestStreak = habits.reduce((b, h) => Math.max(b, getStreak(h)), 0);
  document.getElementById('numDone').textContent = doneCount;
  document.getElementById('numLeft').textContent = leftCount;
  document.getElementById('numStreak').textContent = bestStreak;
  updateRing(doneCount, habits.length);

  initSortable();
  checkAndCelebrate();
}

function updateRing(done, total) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const circ = 163.4;
  document.getElementById('ringProgress').style.strokeDashoffset = circ - (circ * pct) / 100;
  document.getElementById('ringPct').textContent = pct + '%';
}

function toggleDay(id, date) {
  const h = habits.find((x) => x.id === id);
  if (!h) return;
  if (h.log[date]) delete h.log[date];
  else h.log[date] = 1;
  saveHabits();
  render();
}

/* ══════════════════════════════════
   SORTABLE (drag to reorder)
══════════════════════════════════ */
function initSortable() {
  destroySortable();
  const el = document.getElementById('todayHabits');
  if (!el || typeof Sortable === 'undefined') return;
  sortableInstance = Sortable.create(el, {
    handle: '.drag-handle',
    animation: 180,
    easing: 'cubic-bezier(.4,0,.2,1)',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    onEnd(evt) {
      const moved = habits.splice(evt.oldIndex, 1)[0];
      habits.splice(evt.newIndex, 0, moved);
      saveHabits();
      // No full re-render; DOM is already updated by Sortable
    },
  });
}

function destroySortable() {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
}

/* ══════════════════════════════════
   GRID VIEW
══════════════════════════════════ */
function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

function renderGrid() {
  const today = todayStr();
  const months = [
    t('grid.month_jan'),
    t('grid.month_feb'),
    t('grid.month_mar'),
    t('grid.month_apr'),
    t('grid.month_may'),
    t('grid.month_jun'),
    t('grid.month_jul'),
    t('grid.month_aug'),
    t('grid.month_sep'),
    t('grid.month_oct'),
    t('grid.month_nov'),
    t('grid.month_dec'),
  ];
  const isWeek = gridMode === 'week';

  document.querySelector('#view-grid .view-eyebrow').textContent = isWeek ? t('grid.weekly') : t('grid.monthly');
  document.getElementById('gridToggle').textContent = isWeek ? t('grid.toggle_month') : t('grid.toggle_week');

  let dates;
  if (isWeek) {
    dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(gridWeekStart);
      d.setDate(d.getDate() + i);
      dates.push({ str: fmtDate(d), date: d, day: d.getDate(), dow: d.getDay() });
    }
    const start = dates[0].date;
    const end = dates[6].date;
    const fmt = (d) => d.toLocaleDateString(getLocale(), { month: 'short', day: 'numeric' });
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      document.getElementById('gridMonthTitle').textContent = `${fmt(start)} – ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      document.getElementById('gridMonthTitle').textContent = `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
    }
  } else {
    const count = daysInMonth(gridYear, gridMonth);
    dates = Array.from({ length: count }, (_, i) => {
      const d = new Date(gridYear, gridMonth, i + 1);
      return { str: fmtDate(d), date: d, day: i + 1, dow: d.getDay() };
    });
    document.getElementById('gridMonthTitle').textContent = `${months[gridMonth]} ${gridYear}`;
  }

  // Day headers
  const hdrs = document.getElementById('gridDayHeaders');
  hdrs.innerHTML = '';
  dates.forEach(({ str, date, day, dow }) => {
    const el = document.createElement('div');
    let cls = 'grid-day-h' + (str === today ? ' is-today' : '') + (dow === 0 || dow === 6 ? ' is-weekend' : '');
    if (isWeek) cls += ' is-week-mode';
    el.className = cls;
    if (isWeek) {
      el.innerHTML = `<span class="gd-weekday">${date.toLocaleDateString(getLocale(), { weekday: 'short' })}</span><span class="gd-daynum">${day}</span>`;
    } else {
      el.textContent = day;
    }
    hdrs.appendChild(el);
  });

  // Labels
  const labels = document.getElementById('gridLabels');
  labels.innerHTML = '';
  habits.forEach((h) => {
    const row = document.createElement('div');
    row.className = 'grid-label-row';
    row.style.setProperty('--hc', h.color);
    const icon = getIconData(h);
    row.innerHTML = `<span class="grid-label-icon">${icon.lucide ? `<i data-lucide="${icon.lucide}" class="grid-lucide-icon"></i>` : icon.emoji}</span><span class="grid-label-text">${getHabitName(h)}</span>`;
    row.style.height = '36px';
    row.addEventListener('click', () => openModal(h.id));
    labels.appendChild(row);
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Dot rows
  const rows = document.getElementById('gridRows');
  rows.innerHTML = '';
  habits.forEach((h) => {
    const row = document.createElement('div');
    row.className = 'grid-habit-row';
    if (isWeek) row.classList.add('grid-habit-row-week');
    dates.forEach(({ str }) => {
      const isFuture = str > today;
      const isDone = !!h.log[str];
      const isToday = str === today;
      const dot = document.createElement('div');
      let cls = 'grid-dot';
      if (isWeek) cls += ' gd-week';
      const streakLen = isDone ? Math.min(getStreakAtDate(h, str), 14) : 0;
      if (isDone) cls += ' gd-done';
      if (isToday) cls += ' gd-today';
      if (isFuture) cls += ' gd-future';
      dot.className = cls;
      if (isDone) {
        const intensity = 0.15 + streakLen * 0.06;
        dot.style.setProperty('--dot-color', h.color);
        dot.style.setProperty('--dot-intensity', intensity);
      }
      if (!isFuture) dot.addEventListener('click', () => toggleDay(h.id, str));
      row.appendChild(dot);
    });
    rows.appendChild(row);
  });

  if (!habits.length) {
    labels.innerHTML = `<div style="padding:20px 8px;color:var(--text3);font-size:13px;">${t('grid.no_habits')}</div>`;
  }
}

/* ══════════════════════════════════
   STATS VIEW
══════════════════════════════════ */
function renderStats() {
  const today = todayStr();
  const totalHabits = habits.length;
  const totalCheckins = habits.reduce((s, h) => s + Object.keys(h.log).length, 0);
  const doneToday = habits.filter((h) => !!h.log[today]).length;
  const bestStreak = habits.reduce((b, h) => Math.max(b, getBestStreak(h)), 0);

  const content = document.getElementById('statsContent');
  content.innerHTML = '';

  // Top tiles
  const topRow = document.createElement('div');
  topRow.className = 'stats-top-row';
  const th = (k) => t(k);
  [
    { label: th('stats.habits'), val: totalHabits, sub: th('stats.tracking') },
    { label: th('stats.done_today'), val: `${doneToday}/${totalHabits}`, sub: th('stats.completed') },
    { label: th('stats.best_streak'), val: bestStreak, sub: th('stats.days_row') },
    { label: th('stats.total'), val: totalCheckins, sub: th('stats.checkins') },
  ].forEach((t) => {
    topRow.innerHTML += `
      <div class="stat-tile">
        <div class="stat-tile-label">${t.label}</div>
        <div class="stat-tile-val">${t.val}</div>
        <div class="stat-tile-sub">${t.sub}</div>
      </div>`;
  });
  content.appendChild(topRow);

  // AI Weekly Summary
  const s4 = AI.getSettings();
  if (habits.length && s4.enabled && s4.features.weeklySummary) {
    const summarySection = document.createElement('div');
    summarySection.className = 'ai-summary-section';
    summarySection.innerHTML = createAILoading('ai.summary_title');
    content.appendChild(summarySection);
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return fmtDate(d);
    });
    AI.generateWeeklySummary(habits, weekDates, currentLang)
      .then((html) => {
        if (html) summarySection.innerHTML = createAICard('ai.summary_title', html);
      })
      .catch(() => {
        summarySection.remove();
      });
  }

  // Per-habit rows
  if (habits.length) {
    const listWrap = document.createElement('div');
    listWrap.className = 'stats-habit-list';
    habits.forEach((h) => {
      const curStreak = getStreak(h);
      const bstStreak = getBestStreak(h);
      let possible = 0,
        done = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (fmtDate(d) <= today) {
          possible++;
          if (h.log[fmtDate(d)]) done++;
        }
      }
      const pct = possible ? Math.round((done / possible) * 100) : 0;
      const icon = getIconData(h);
      const row = document.createElement('div');
      row.className = 'stats-habit-row';
      row.style.setProperty('--hc', h.color);
      row.innerHTML = `
        <div class="shr-icon">${icon.lucide ? `<i data-lucide="${icon.lucide}" class="shr-lucide-icon"></i>` : icon.emoji}</div>
        <div class="shr-info">
          <div class="shr-name">${getHabitName(h)}</div>
          <div class="shr-bar-wrap">
            <div class="shr-bar" style="width:${pct}%;background:${h.color}"></div>
          </div>
        </div>
        <div class="shr-nums">
          <div class="shr-streak" style="color:${h.color}">
            <span class="shr-streak-val">${curStreak}</span><span class="shr-streak-label">${t('stats.current')}</span>
            <span class="shr-streak-sep">|</span>
            <span class="shr-streak-val">${bstStreak}</span><span class="shr-streak-label">${t('stats.best')}</span>
            <span class="shr-streak-fire">🔥</span>
          </div>
          <div class="shr-days">${t('stats.pct_30d', { pct })}</div>
        </div>
      `;
      row.addEventListener('click', () => openModal(h.id));
      listWrap.appendChild(row);
    });
    content.appendChild(listWrap);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Heatmap — 7-day-week grid
  const hmSection = document.createElement('div');
  hmSection.className = 'heatmap-section';
  hmSection.innerHTML = `<div class="heatmap-title">${t('stats.heatmap')}</div><div class="heatmap-grid" id="hmGrid"></div>`;
  content.appendChild(hmSection);
  setTimeout(() => {
    const grid = document.getElementById('hmGrid');
    if (!grid) return;
    const DAYS = [
      t('stats.day_sun'),
      t('stats.day_mon'),
      t('stats.day_tue'),
      t('stats.day_wed'),
      t('stats.day_thu'),
      t('stats.day_fri'),
      t('stats.day_sat'),
    ];
    const allDays = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = fmtDate(d);
      const count = habits.filter((h) => h.log[key]).length;
      allDays.push({ key, count, dow: d.getDay() });
    }
    for (let dow = 0; dow < 7; dow++) {
      const row = document.createElement('div');
      row.className = 'hm-week-row';
      const label = document.createElement('span');
      label.className = 'hm-dow-label';
      label.textContent = DAYS[dow];
      row.appendChild(label);
      allDays
        .filter((d) => d.dow === dow)
        .forEach((d) => {
          const cell = document.createElement('div');
          const lvl = d.count === 0 ? '' : d.count === 1 ? 'l1' : d.count === 2 ? 'l2' : d.count <= 3 ? 'l3' : 'l4';
          cell.className = 'hm-cell ' + lvl;
          cell.title =
            d.count === 1
              ? t('stats.cell_title', { date: d.key, count: d.count })
              : t('stats.cell_title_plural', { date: d.key, count: d.count });
          row.appendChild(cell);
        });
      grid.appendChild(row);
    }
  }, 0);
}

/* ══════════════════════════════════
   MODAL
══════════════════════════════════ */
function renderEmojiGrid(selectedId) {
  const grid = document.getElementById('emojiGrid');
  grid.innerHTML = '';
  const cats = [...new Set(HABIT_ICONS.map((i) => i.cat))];
  cats.forEach((cat) => {
    const label = document.createElement('div');
    label.className = 'emoji-cat';
    label.textContent = t('modal.cat_' + cat);
    grid.appendChild(label);
    const wrap = document.createElement('div');
    wrap.className = 'emoji-row';
    HABIT_ICONS.filter((i) => i.cat === cat).forEach((icon) => {
      const btn = document.createElement('button');
      btn.className = 'icon-tile' + (icon.id === selectedId ? ' active' : '');
      btn.dataset.icon = icon.id;
      btn.style.setProperty('--ic', pickedColor);
      btn.innerHTML = `<i data-lucide="${icon.lucide}" class="picker-lucide-icon"></i><span class="eb-label">${t('icon.' + icon.id)}</span>`;
      btn.addEventListener('click', () => {
        pickedIcon = icon.id;
        document.querySelectorAll('.icon-tile').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
      wrap.appendChild(btn);
    });
    grid.appendChild(wrap);
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openModal(id = null) {
  editingId = id;
  const h = id ? habits.find((x) => x.id === id) : null;
  document.getElementById('modalTitle').textContent = h ? t('modal.edit') : t('modal.new');
  document.getElementById('habitName').value = h ? getHabitName(h) : '';
  document.getElementById('delBtn').style.display = h ? 'inline-flex' : 'none';

  pickedColor = h ? h.color : '#818cf8';
  pickedIcon = h ? h.icon || 'run' : 'run';

  // Populate translation fields
  if (h?.name && typeof h.name === 'object') {
    document.getElementById('habitNameEn').value = h.name.en || '';
    document.getElementById('habitNameHi').value = h.name.hi || '';
    document.getElementById('habitNameTe').value = h.name.te || '';
    document.getElementById('habitNameTranslations').style.display = 'block';
  } else {
    document.getElementById('habitNameEn').value = '';
    document.getElementById('habitNameHi').value = '';
    document.getElementById('habitNameTe').value = '';
    document.getElementById('habitNameTranslations').style.display = 'none';
  }

  renderEmojiGrid(pickedIcon);
  document.querySelectorAll('.cswatch').forEach((s) => s.classList.toggle('active', s.dataset.c === pickedColor));

  document.getElementById('overlay').classList.add('open');
  setTimeout(() => document.getElementById('habitName').focus(), 50);
}

function getHabitName(h) {
  if (!h.name) return '';
  if (typeof h.name === 'string') return h.name;
  return h.name[currentLang] || h.name.en || Object.values(h.name)[0] || '';
}

function closeModal() {
  document.getElementById('overlay').classList.remove('open');
  editingId = null;
}

function saveHabit() {
  const name = document.getElementById('habitName').value.trim();
  if (!name) {
    document.getElementById('habitName').focus();
    return;
  }

  const nameTranslations = {
    en: document.getElementById('habitNameEn').value.trim() || name,
    hi: document.getElementById('habitNameHi').value.trim() || '',
    te: document.getElementById('habitNameTe').value.trim() || '',
  };

  if (editingId) {
    const h = habits.find((x) => x.id === editingId);
    if (h) {
      h.name = nameTranslations;
      h.color = pickedColor;
      h.icon = pickedIcon;
    }
  } else {
    habits.push({ id: uid(), name: nameTranslations, color: pickedColor, icon: pickedIcon, log: {} });
  }
  saveHabits();
  closeModal();
  render();
}

function deleteHabit() {
  if (!editingId || !confirm(t('modal.confirm_delete'))) return;
  habits = habits.filter((h) => h.id !== editingId);
  saveHabits();
  closeModal();
  if (!habits.length) setView('landing');
  else render();
}

/* ══════════════════════════════════
   NAVIGATION
══════════════════════════════════ */
function setView(v) {
  view = v;
  document.body.classList.toggle('landing-mode', v === 'landing');
  document.querySelectorAll('.nav-btn, .bnav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  document.querySelectorAll('.view').forEach((el) => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  render();
}

/* ══════════════════════════════════
   INIT
══════════════════════════════════ */
async function init() {
  await loadHabits();

  // Dynamic default view based on habit availability
  if (habits.length === 0) {
    view = 'landing';
  } else {
    view = 'today';
  }

  const now = new Date();
  gridYear = now.getFullYear();
  gridMonth = now.getMonth();
  gridWeekStart = getMonday(now);

  // Inject SVG gradient defs
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#818cf8"/>
          <stop offset="100%" stop-color="#c084fc"/>
        </linearGradient>
      </defs>
    </svg>`,
  );

  // Sidebar nav + bottom nav
  document.querySelectorAll('.nav-btn, .bnav-btn').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  document.getElementById('bnavAdd').addEventListener('click', () => openModal());

  // Language switcher
  document.querySelectorAll('.lang-btn').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  // Add btn (sidebar)
  document.getElementById('openAdd').addEventListener('click', () => openModal());

  // Grid nav — mode-aware
  document.getElementById('prevMonth').addEventListener('click', () => {
    if (gridMode === 'week') {
      gridWeekStart.setDate(gridWeekStart.getDate() - 7);
    } else {
      gridMonth--;
      if (gridMonth < 0) {
        gridMonth = 11;
        gridYear--;
      }
    }
    render();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    if (gridMode === 'week') {
      gridWeekStart.setDate(gridWeekStart.getDate() + 7);
    } else {
      gridMonth++;
      if (gridMonth > 11) {
        gridMonth = 0;
        gridYear++;
      }
    }
    render();
  });
  document.getElementById('goToday').addEventListener('click', () => {
    const n = new Date();
    if (gridMode === 'week') {
      gridWeekStart = getMonday(n);
    } else {
      gridYear = n.getFullYear();
      gridMonth = n.getMonth();
    }
    render();
  });

  // Grid toggle
  document.getElementById('gridToggle').addEventListener('click', () => {
    gridMode = gridMode === 'week' ? 'month' : 'week';
    const btn = document.getElementById('gridToggle');
    btn.textContent = gridMode === 'week' ? t('grid.toggle_month') : t('grid.toggle_week');
    btn.classList.toggle('active', gridMode === 'week');
    if (gridMode === 'week') {
      gridWeekStart = getMonday(new Date());
    }
    render();
  });

  // AI Settings Panel
  initAISettingsPanel();

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('saveBtn').addEventListener('click', saveHabit);
  document.getElementById('delBtn').addEventListener('click', deleteHabit);

  document.querySelectorAll('.cswatch').forEach((s) =>
    s.addEventListener('click', () => {
      pickedColor = s.dataset.c;
      document.querySelectorAll('.cswatch').forEach((x) => x.classList.toggle('active', x === s));
    }),
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('overlay').classList.contains('open')) saveHabit();
  });

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('SW:', err));
  }

  // Init language
  document.documentElement.lang = currentLang;
  document.querySelectorAll('.lang-btn').forEach((b) => b.classList.toggle('active', b.dataset.lang === currentLang));

  // Go to correct view
  setView(view);
  // Translate static HTML
  translatePage();
  // Init Lucide icons (for landing page static HTML)
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
