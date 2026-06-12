/* ══════════════════════════════════
   Streakr — AI Module
   Ollama (local), OpenAI, Anthropic
══════════════════════════════════ */
const AI_SETTINGS_KEY = 'streakr_ai_settings';
const AI_CACHE_KEY = 'streakr_ai_cache';

let aiSettings = loadAISettings();
let aiCache = loadAICache();

function loadAISettings() {
  try { return JSON.parse(localStorage.getItem(AI_SETTINGS_KEY)) || defaultAISettings(); }
  catch { return defaultAISettings(); }
}

function defaultAISettings() {
  return {
    enabled: false,
    provider: 'ollama',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    openaiKey: '',
    openaiModel: 'gpt-4o-mini',
    anthropicKey: '',
    anthropicModel: 'claude-3-5-haiku-latest',
    features: { weeklySummary: true, streakMessages: true, recoveryAdvice: true },
  };
}

function saveAISettings() {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(aiSettings));
}

function loadAICache() {
  try { return JSON.parse(localStorage.getItem(AI_CACHE_KEY)) || {}; }
  catch { return {}; }
}

function saveAICache() {
  localStorage.setItem(AI_CACHE_KEY, JSON.stringify(aiCache));
}

function getCached(key, ttlMs) {
  const entry = aiCache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    delete aiCache[key];
    saveAICache();
    return null;
  }
  return entry.text;
}

function setCache(key, text) {
  aiCache[key] = { text, ts: Date.now() };
  saveAICache();
}

function buildCacheKey(prefix, data) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
  return `${prefix}_${hash}`;
}

async function generate(messages, opts = {}) {
  const { provider, ollamaUrl, ollamaModel, openaiKey, openaiModel, anthropicKey, anthropicModel } = aiSettings;
  const p = opts.provider || provider;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeout || 30000);

  try {
    if (p === 'ollama') {
      const url = opts.ollamaUrl || ollamaUrl;
      // Use proxy to bypass CORS when URL is localhost
      const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
      const endpoint = isLocalhost ? '/api/ai/chat' : `${url}/api/chat`;
      const body = JSON.stringify({
        model: opts.model || ollamaModel,
        messages,
        stream: false,
        options: { temperature: 0.7, num_predict: opts.maxTokens || 300 },
      });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(isLocalhost ? {} : {}) },
        body: isLocalhost ? JSON.stringify({ url: `${url}/api/chat`, ...JSON.parse(body) }) : body,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Ollama: ${res.status}`);
      const data = await res.json();
      return (data.message && data.message.content) || '';
    }

    if (p === 'openai') {
      const key = opts.openaiKey || openaiKey;
      if (!key) throw new Error('OpenAI API key not set');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
          model: opts.model || openaiModel,
          messages,
          temperature: 0.7,
          max_tokens: opts.maxTokens || 300,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
      const data = await res.json();
      return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    }

    if (p === 'anthropic') {
      const key = opts.anthropicKey || anthropicKey;
      if (!key) throw new Error('Anthropic API key not set');
      const sysMsg = messages.find(m => m.role === 'system');
      const userMsgs = messages.filter(m => m.role !== 'system');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: opts.model || anthropicModel,
          max_tokens: opts.maxTokens || 300,
          system: sysMsg ? sysMsg.content : undefined,
          messages: userMsgs.length ? userMsgs : [{ role: 'user', content: '.' }],
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Anthropic: ${res.status}`);
      const data = await res.json();
      return (data.content && data.content[0] && data.content[0].text) || '';
    }

    throw new Error(`Unknown provider: ${p}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function testConnection() {
  try {
    const msg = await generate([{ role: 'user', content: 'Reply with exactly: OK' }], { maxTokens: 10 });
    return msg.includes('OK');
  } catch {
    return false;
  }
}

const LANG_NAMES = { en: 'English', hi: 'Hindi', te: 'Telugu' };

/* ── Feature: Weekly Summary ── */
async function generateWeeklySummary(habits, weekDates, lang = 'en') {
  if (!aiSettings.enabled || !aiSettings.features.weeklySummary) return null;

  const weekStart = weekDates[0];
  const weekEnd = weekDates[weekDates.length - 1];
  const cacheKey = buildCacheKey('weekly_summary', `${weekStart}_${weekEnd}_${lang}`);

  const cached = getCached(cacheKey, 7 * 24 * 60 * 60 * 1000);
  if (cached) return cached;

  const langName = LANG_NAMES[lang] || 'English';
  const data = habits.map(h => {
    const done = weekDates.filter(d => h.log[d]).length;
    const name = h.name && h.name[lang] ? h.name[lang] : h.name;
    return `${name}: ${done}/${weekDates.length} days`;
  }).join('; ');

  try {
    const text = await generate([
      { role: 'system', content: `You are a supportive habit coach. Summarize the user's week in 2-3 short sentences. Mention streaks and patterns. Keep it warm and concise. Reply in ${langName}.` },
      { role: 'user', content: `My habit data this week: ${data}` },
    ], { maxTokens: 200 });

    const clean = text.trim();
    if (clean) setCache(cacheKey, clean);
    return clean || null;
  } catch {
    return null;
  }
}

/* ── Feature: Streak Message ── */
async function getStreakMessage(allDone, streakMilestone, lang = 'en') {
  if (!aiSettings.enabled || !aiSettings.features.streakMessages) return null;

  const cacheKey = buildCacheKey('streak_msg', `${allDone}_${streakMilestone}_${lang}`);

  const cached = getCached(cacheKey, 24 * 60 * 60 * 1000);
  if (cached) return cached;

  const langName = LANG_NAMES[lang] || 'English';
  let milestoneText = '';
  if (streakMilestone >= 90) milestoneText = '90-day milestone';
  else if (streakMilestone >= 60) milestoneText = '60-day milestone';
  else if (streakMilestone >= 30) milestoneText = '30-day milestone';
  else if (streakMilestone >= 21) milestoneText = '21-day milestone';
  else if (streakMilestone >= 14) milestoneText = '14-day milestone';
  else if (streakMilestone >= 7) milestoneText = '7-day milestone';
  else milestoneText = 'all habits done today';

  try {
    const text = await generate([
      { role: 'system', content: `Generate a short warm congratulatory message (1 sentence, max 15 words). Be encouraging. Reply in ${langName}.` },
      { role: 'user', content: `User hit: ${milestoneText}` },
    ], { maxTokens: 60 });

    const clean = text.trim();
    if (clean) setCache(cacheKey, clean);
    return clean || null;
  } catch {
    return null;
  }
}

/* ── Feature: Recovery Advice ── */
async function getRecoveryAdvice(habitName, missedDays, lang = 'en') {
  if (!aiSettings.enabled || !aiSettings.features.recoveryAdvice) return null;

  const cacheKey = buildCacheKey('recovery', `${habitName}_${missedDays}_${lang}`);

  const cached = getCached(cacheKey, 24 * 60 * 60 * 1000);
  if (cached) return cached;

  const langName = LANG_NAMES[lang] || 'English';

  try {
    const text = await generate([
      { role: 'system', content: `Suggest ONE tiny specific action the user can take right now to get back on track. Keep it under 12 words. Encouraging, not guilt-inducing. Reply in ${langName}.` },
      { role: 'user', content: `Missed "${habitName}" for ${missedDays} days.` },
    ], { maxTokens: 50 });

    const clean = text.trim();
    if (clean) setCache(cacheKey, clean);
    return clean || null;
  } catch {
    return null;
  }
}

/* ── Public API ── */
window.AI = {
  generate,
  testConnection,
  generateWeeklySummary,
  getStreakMessage,
  getRecoveryAdvice,
  getSettings: () => ({ ...aiSettings }),
  setSettings: (s) => { aiSettings = { ...aiSettings, ...s }; saveAISettings(); }
};
