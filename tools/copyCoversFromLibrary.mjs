#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const LIB = path.join(ROOT, 'data', 'library.json');
const COVERS_SRC = path.join(ROOT, '1.2 CARATULAS LP-20251015T013115Z-1-001', '1.2 CARATULAS LP', 'CARATULAS 3');
const APP_COVERS_DIR = path.join(ROOT, 'app-museo-vallenato', 'assets', 'covers');
const MAP_FILE = path.join(APP_COVERS_DIR, 'map.ts');

function main(){
  if (!fs.existsSync(LIB)) {
    console.error('No existe data/library.json');
    process.exit(1);
  }
  const lib = JSON.parse(fs.readFileSync(LIB,'utf8'));
  const files = new Set();
  for (const it of lib.items) {
    if (it.imageUrl) {
      const name = it.imageUrl.split('/').pop();
      if (name) files.add(name);
    }
  }
  if (!fs.existsSync(APP_COVERS_DIR)) fs.mkdirSync(APP_COVERS_DIR, { recursive: true });
  const mapLines = [
    '// Generado por tools/copyCoversFromLibrary.mjs',
    'export const coversMap: Record<string, any> = {',
  ];
  let copied = 0;
  for (const name of files) {
    const src = path.join(COVERS_SRC, name);
    const dst = path.join(APP_COVERS_DIR, name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dst);
      mapLines.push(`  '${name}': require('./${name}'),`);
      copied++;
    }
  }
  mapLines.push('};');
  fs.writeFileSync(MAP_FILE, mapLines.join('\n'),'utf8');
  console.log(`Copiadas ${copied} carátulas y actualizado ${MAP_FILE}`);
}

main();
