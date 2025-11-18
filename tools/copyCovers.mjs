#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const SRC_COVERS = path.join(ROOT, '1.2 CARATULAS LP-20251015T013115Z-1-001', '1.2 CARATULAS LP', 'CARATULAS 3');
const DEST_DIR = path.join(ROOT, 'app-museo-vallenato', 'assets', 'covers');
const LIB_JSON = path.join(ROOT, 'data', 'library.json');

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

// 1) Leer las portadas referenciadas en el catálogo
const lib = JSON.parse(fs.readFileSync(LIB_JSON, 'utf8'));
const referenced = new Set(
  lib.items
    .map(it => it.imageUrl)
    .filter(Boolean)
    .map(u => u.split(/[\\/]/).pop())
);

// 2) Copiar solo las referenciadas que existan en el origen
let copied = 0;
for (const fname of referenced) {
  const src = path.join(SRC_COVERS, fname);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DEST_DIR, fname));
    copied++;
  }
}

// 3) Si hay pocas referenciadas, completa con algunas extra para usar como fallback
if (copied < 24) {
  const extra = fs.readdirSync(SRC_COVERS).filter(f=>/\.(jpe?g|png)$/i.test(f));
  for (const f of extra) {
    if (referenced.has(f)) continue;
    fs.copyFileSync(path.join(SRC_COVERS, f), path.join(DEST_DIR, f));
    copied++;
    if (copied >= 36) break;
  }
}

// 4) Generar assets/covers/map.ts automáticamente
const files = fs.readdirSync(DEST_DIR).filter(f=>/\.(jpe?g|png)$/i.test(f));
const lines = [];
lines.push('// Archivo generado por tools/copyCovers.mjs');
lines.push('export const coversMap: Record<string, any> = {');
for (const f of files) {
  lines.push(`  '${f}': require('./${f}'),`);
}
lines.push('};');
fs.writeFileSync(path.join(DEST_DIR, 'map.ts'), lines.join('\n'), 'utf8');

console.log(`Copiadas ${copied} carátulas y generado mapa en ${path.join(DEST_DIR,'map.ts')}`);
