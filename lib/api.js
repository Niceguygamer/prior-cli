'use strict';

const fetch  = require('node-fetch');
const { getToken } = require('./config');

const BASE     = 'https://prior.ngrok.app';
const CLI_BASE = 'https://prior.ngrok.app/cli-backend';

// ── Infer — single AI call, returns { content, promptTokens, completionTokens }

async function infer(messages, model, token) {
  const res = await fetch(`${CLI_BASE}/api/infer`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ messages, model, token }),
    timeout: 120000,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Server error: HTTP ${res.status}`);
  }
  return await res.json();
}

function authHeaders(extra = {}) {
  const token = getToken();
  const h = { 'Content-Type': 'application/json', ...extra };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

// ── Auth ──────────────────────────────────────────────────────

async function login(username, password) {
  const res  = await fetch(`${BASE}/network/api/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
  return data;
}


// ── Direct AI (fallback, no agent) ───────────────────────────

async function generate(prompt, opts = {}, onChunk) {
  const res = await fetch(`${BASE}/prior/api/generate`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({
      prompt,
      stream:     true,
      model:      opts.model      || undefined,
      uncensored: opts.uncensored || false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }

  return new Promise((resolve, reject) => {
    let full = '';
    let buf  = '';

    function processLines(raw) {
      const lines = raw.split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^data:\s*/, '').trim();
        if (!trimmed || trimmed === '[DONE]') continue;
        try {
          const json = JSON.parse(trimmed);
          const text = json.response ?? json.content ?? json.token ?? '';
          if (text) { full += text; onChunk(text); }
        } catch { /* skip */ }
      }
    }

    res.body.on('data', chunk => {
      let raw = chunk.toString();
      try {
        const unwrapped = JSON.parse(raw);
        if (typeof unwrapped === 'string') raw = unwrapped;
      } catch { /* not outer-encoded */ }
      buf += raw;
      const lines = buf.split('\n');
      buf = lines.pop();
      processLines(lines.join('\n'));
    });

    res.body.on('end', () => {
      if (buf.trim()) {
        let raw = buf.trim();
        try { const u = JSON.parse(raw); if (typeof u === 'string') raw = u; } catch {}
        processLines(raw);
      }
      resolve(full);
    });

    res.body.on('error', reject);
  });
}

// ── Image generation ──────────────────────────────────────────

async function generateImage(prompt, opts = {}) {
  const res  = await fetch(`${BASE}/prior/api/tools/generate-image`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({
      prompt,
      width:  opts.width  || 896,
      height: opts.height || 896,
      steps:  opts.steps  || 20,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function pollImageProgress(promptId) {
  const res  = await fetch(`${BASE}/prior/api/tools/image-gen-progress/${promptId}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function downloadImage(filename) {
  const res = await fetch(
    `${BASE}/prior/api/media/images/${encodeURIComponent(filename)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

// ── Other endpoints ───────────────────────────────────────────

async function getModels() {
  const res  = await fetch(`${BASE}/prior/api/models`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function getChats() {
  const res  = await fetch(`${BASE}/prior/api/prior_ai_chats`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function getUsage() {
  // Try the local backend first — avoids the guest-redirect issue on the public API
  try {
    const r = await fetch(`${CLI_BASE}/api/usage`, { headers: authHeaders(), timeout: 5000 });
    if (r.ok) return await r.json();
  } catch { /* backend offline, fall through */ }

  // Fallback: public API (may hit redirect issues for some tokens)
  const res  = await fetch(`${BASE}/prior/api/usage`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function getWeather(location) {
  const res  = await fetch(
    `${BASE}/prior/api/tools/weather?location=${encodeURIComponent(location)}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function search(query) {
  const res  = await fetch(`${BASE}/prior/api/tools/url-reader`, {
    method:  'POST',
    headers: authHeaders(),
    body:    JSON.stringify({ url: query }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
  return data;
}

async function acceptTos() {
  const res  = await fetch(`${BASE}/network/api/user/tos-accept`, {
    method:  'POST',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to accept ToS');
  return data; // { ok, token, tos_accepted_at }
}

module.exports = {
  login, infer, acceptTos,
  generate,
  generateImage, pollImageProgress, downloadImage,
  getModels, getChats, getUsage, getWeather, search,
};
