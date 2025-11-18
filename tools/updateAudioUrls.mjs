#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Config
const ROOT = path.resolve(process.cwd());
const DATA_LIB = path.join(ROOT, 'data', 'library.json');
const APP_LIB = path.join(ROOT, 'app-museo-vallenato', 'assets', 'data', 'library.json');
// Usa IP local si se pasa como argumento, sino intenta detectar desde hostUri anterior.
const HOST = process.argv[2] || '192.168.1.10';
const PORT = process.argv[3] || '5173';
const BASE = `http://${HOST}:${PORT}`;

function encodeSegments(rel) {
  return rel.split('/')
    .map(seg => encodeURIComponent(seg).replace(/%20/g,'+')) // opcional: + para espacios
    .join('/');
}

function transform(item) {
  const local = item.audioUrl.replace(/\\/g,'/');
  // El root siempre arranca con 'Canciones Vallenatas/'
  const rel = local.replace(/^Canciones Vallenatas\//,'');
  const encoded = encodeSegments(rel);
  return { ...item, audioUrl: `${BASE}/${encoded}` };
}

function main() {
  if (!fs.existsSync(DATA_LIB)) {
    console.error('No se encuentra library.json en data/. Ejecuta buildLibrary.mjs primero.');
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(DATA_LIB,'utf8'));
  const items = json.items.map(transform);
  const out = { ...json, items, updatedAt: new Date().toISOString(), remoteBase: BASE };
  fs.writeFileSync(DATA_LIB, JSON.stringify(out,null,2),'utf8');
  fs.writeFileSync(APP_LIB, JSON.stringify(out,null,2),'utf8');
  console.log(`Actualizados ${items.length} audioUrl a remoto ${BASE}`);
}

main();
