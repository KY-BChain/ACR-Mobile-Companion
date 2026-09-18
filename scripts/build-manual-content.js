#!/usr/bin/env node
// Turn the reviewer manuals in docs/clinical into the paged content the app shows
// under READ DETAILS. The Markdown files stay the single source of truth.
//
//   node scripts/build-manual-content.js
//
// One page per "## " heading. Tables become label/value rows, so nothing has to
// scroll sideways on a phone.
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
// Every language the app offers has its own manual, named by the same
// convention: docs/clinical/ACR_Companion_User_Manual_<CODE>.md.
const SOURCES = {
  'en-GB': 'docs/clinical/ACR_Companion_User_Manual_EN.md',
  'zh-CN': 'docs/clinical/ACR_Companion_User_Manual_ZH-CN.md',
  'fr-FR': 'docs/clinical/ACR_Companion_User_Manual_FR.md',
  'de-DE': 'docs/clinical/ACR_Companion_User_Manual_DE.md',
  'ru-RU': 'docs/clinical/ACR_Companion_User_Manual_RU.md',
  'ar-SA': 'docs/clinical/ACR_Companion_User_Manual_AR.md',
  'ko-KR': 'docs/clinical/ACR_Companion_User_Manual_KO.md',
  'ja-JP': 'docs/clinical/ACR_Companion_User_Manual_JA.md',
};
const OUT_DIR = path.join(REPO, 'src/content/manual');

const plain = (text) => text
  .replace(/\*\*(.+?)\*\*/g, '$1')
  .replace(/\*(.+?)\*/g, '$1')
  .replace(/`(.+?)`/g, '$1')
  .replace(/\[(.+?)\]\(.+?\)/g, '$1')
  .trim();

const isDivider = (cells) => cells.every(cell => /^:?-{2,}:?$/.test(cell.trim()));
const splitRow = row => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => plain(cell));

function parse(markdown) {
  const lines = markdown.split('\n');
  const pages = [];
  let page = null;
  let table = null;

  const endTable = () => {
    if (!table) return;
    const [head, ...body] = table;
    for (const cells of body) {
      const label = cells[0] || '';
      const rest = cells.slice(1).filter(Boolean);
      const value = rest.map((cell, index) => {
        const heading = head[index + 1];
        return heading && head.filter(Boolean).length > 1 ? `${heading}: ${cell}` : cell;
      }).join(' · ');
      page.blocks.push({ type: 'row', label, value });
    }
    table = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      endTable();
      page = { title: plain(line.slice(3)), blocks: [] };
      pages.push(page);
      continue;
    }
    if (!page) continue;
    if (line.startsWith('|')) {
      const cells = splitRow(line);
      if (isDivider(cells)) continue;
      if (!table) table = [cells];
      else table.push(cells);
      continue;
    }
    endTable();
    if (!line || line === '---') continue;
    if (line.startsWith('### ')) { page.blocks.push({ type: 'heading', text: plain(line.slice(4)) }); continue; }
    if (/^[-*] /.test(line)) { page.blocks.push({ type: 'bullet', text: plain(line.slice(2)) }); continue; }
    const numbered = line.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) { page.blocks.push({ type: 'bullet', text: `${numbered[1]}. ${plain(numbered[2])}` }); continue; }
    page.blocks.push({ type: 'paragraph', text: plain(line) });
  }
  endTable();
  return pages.filter(p => p.blocks.length);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [locale, source] of Object.entries(SOURCES)) {
  const pages = parse(fs.readFileSync(path.join(REPO, source), 'utf8'));
  const out = path.join(OUT_DIR, `${locale}.json`);
  fs.writeFileSync(out, `${JSON.stringify({ source, pages }, null, 2)}\n`);
  const blocks = pages.reduce((sum, p) => sum + p.blocks.length, 0);
  process.stdout.write(`${locale}: ${pages.length} pages, ${blocks} blocks → ${path.relative(REPO, out)}\n`);
}
