#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'data', 'library.json');
const DEST_DIR = path.join(ROOT, 'app-museo-vallenato', 'assets', 'data');
const DEST = path.join(DEST_DIR, 'library.json');

if (!fs.existsSync(SRC)) {
  console.error('No existe data/library.json. Ejecute buildLibrary primero.');
  process.exit(1);
}
if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });
fs.copyFileSync(SRC, DEST);
console.log('Copiado catálogo a', DEST);
