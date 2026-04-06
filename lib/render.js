'use strict';

const chalk = require('chalk');
const THEME = '#9CE2D4';

// ── Inline markup ─────────────────────────────────────────────

function renderInline(text) {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, (_,t) => chalk.bold.italic(t))
    .replace(/\*\*(.+?)\*\*/g,     (_,t) => chalk.bold(t))
    .replace(/`([^`]+)`/g,          (_,t) => chalk.hex(THEME)(t))
    .replace(/\*([^*\n]+)\*/g,      (_,t) => chalk.italic(t));
}

// ── Block renderer ────────────────────────────────────────────

function renderMarkdown(text, indent = '  ') {
  const lines  = text.split('\n');
  const out    = [];
  let inCode   = false;
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence open/close
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      if (!inCode) {
        inCode   = true;
        codeLang = fenceMatch[1] || 'code';
        out.push(chalk.dim(`${indent}┌─ ${codeLang} ${'─'.repeat(Math.max(0, 36 - codeLang.length))}`));
      } else {
        inCode = false;
        out.push(chalk.dim(`${indent}└${'─'.repeat(40)}`));
      }
      continue;
    }

    if (inCode) {
      out.push(chalk.hex(THEME)(`${indent}│ `) + chalk.white(line));
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      out.push(chalk.dim(`${indent}${'─'.repeat(44)}`));
      continue;
    }

    // Headings
    let m;
    if ((m = line.match(/^(#{1,3}) (.+)/))) {
      const level = m[1].length;
      const txt   = m[2];
      if (level === 1) out.push(`\n${indent}${chalk.bold.underline(txt)}`);
      else if (level === 2) out.push(`\n${indent}${chalk.bold(txt)}`);
      else out.push(`${indent}${chalk.hex(THEME).bold(txt)}`);
      continue;
    }

    // Unordered list
    if ((m = line.match(/^(\s*)[-*+] (.+)/))) {
      const pad = ' '.repeat(m[1].length);
      out.push(`${indent}${pad}${chalk.hex(THEME)('▸')} ${renderInline(m[2])}`);
      continue;
    }

    // Ordered list
    if ((m = line.match(/^(\s*)(\d+)\. (.+)/))) {
      const pad = ' '.repeat(m[1].length);
      out.push(`${indent}${pad}${chalk.dim(m[2] + '.')} ${renderInline(m[3])}`);
      continue;
    }

    // Blockquote
    if ((m = line.match(/^> ?(.*)/))) {
      out.push(chalk.hex(THEME)(`${indent}│ `) + chalk.dim(renderInline(m[1])));
      continue;
    }

    // Empty line
    if (!line.trim()) {
      out.push('');
      continue;
    }

    // Normal paragraph
    out.push(`${indent}${renderInline(line)}`);
  }

  return out.join('\n');
}

module.exports = { renderMarkdown, renderInline };
