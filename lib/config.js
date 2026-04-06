'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const CONFIG_DIR  = path.join(os.homedir(), '.prior');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function getConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveConfig(data) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

function getToken()    { return getConfig().token    || null; }
function getUsername() { return getConfig().username || null; }

function saveAuth(token, username) {
  saveConfig({ ...getConfig(), token, username });
}

function clearAuth() {
  const cfg = getConfig();
  delete cfg.token;
  delete cfg.username;
  saveConfig(cfg);
}

module.exports = { getConfig, saveConfig, getToken, getUsername, saveAuth, clearAuth, CONFIG_DIR };
