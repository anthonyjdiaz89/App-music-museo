#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Paths
const ROOT = path.resolve(process.cwd());
const APP_DIR = path.join(ROOT, 'app-museo-vallenato');
const LIB_JSON = path.join(APP_DIR, 'assets', 'data', 'library.json');
const AUDIO_DST = path.join(APP_DIR, 'assets', 'audio');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function sanitize(name) {
  return name
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function main() {
  ensureDir(AUDIO_DST);
  const lib = JSON.parse(fs.readFileSync(LIB_JSON, 'utf8'));
  const items = lib.items;
  const byGenre = {};
  for (const it of items) {
    if (!byGenre[it.genre]) byGenre[it.genre] = [];
    byGenre[it.genre].push(it);
  }
  const pick = [];
  ['Merengue', 'Paseo', 'Puya', 'Sone'].forEach(g => {
    const arr = byGenre[g] || [];
    if (arr.length) pick.push(arr[0]);
  });

  const lines = [];
  lines.push('// Archivo generado por tools/copySampleAudio.mjs');
  lines.push('export const audioMap: Record<string, any> = {');

  let count = 0;
  for (const it of pick) {
    const src = path.join(ROOT, it.audioUrl);
    if (!fs.existsSync(src)) continue;
    const baseName = sanitize(`${it.genre.toLowerCase()}_${count + 1}.mp3`);
    const dst = path.join(AUDIO_DST, baseName);
    fs.copyFileSync(src, dst);
    lines.push(`  "${it.id}": require("./${baseName}"),`);
    count++;
  }

  lines.push('};');
  const outFile = path.join(APP_DIR, 'assets', 'audio', 'map.ts');
  fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
  console.log(`Copied ${count} sample audio files and wrote map to ${outFile}`);
}

main();
