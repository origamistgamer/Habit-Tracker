const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/api/habits', (_req, res) => {
  res.json(readData());
});

app.put('/api/habits', (req, res) => {
  writeData(req.body);
  res.json({ ok: true });
});

// Ollama proxy to bypass CORS
app.post('/api/ai/chat', async (req, res) => {
  const { url = 'http://localhost:11434/api/chat', ...body } = req.body;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Ollama proxy error:', err);
    res.status(502).json({ error: 'Failed to reach Ollama' });
  }
});

app.listen(PORT, () => {
  console.log(`Streakr running at http://localhost:${PORT}`);
});
