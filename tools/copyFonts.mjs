#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const DEST = path.join(ROOT, 'app-museo-vallenato', 'assets', 'fonts');
if (!fs.existsSync(DEST)) fs.mkdirSync(DEST, { recursive: true });

const SOURCES = [
  path.join(ROOT, 'Fuentes', '3. ARCHIVO', 'static', 'Archivo'),
  path.join(ROOT, 'Fuentes', '2. ROBOTO', 'static'),
  path.join(ROOT, 'Fuentes', '4. BARLOW'),
];

const WANTED = new Set([
  'Archivo-Regular.ttf','Archivo-SemiBold.ttf','Archivo-Bold.ttf',
  'Roboto-Regular.ttf','Barlow-Regular.ttf'
]);

for (const src of SOURCES) {
  if (!fs.existsSync(src)) continue;
  for (const f of fs.readdirSync(src)) {
    if (!/\.ttf$/i.test(f)) continue;
    if (!WANTED.has(f)) continue;
    fs.copyFileSync(path.join(src, f), path.join(DEST, f));
  }
}
console.log('Fuentes copiadas a', DEST);
