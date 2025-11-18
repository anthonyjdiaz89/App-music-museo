#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// Configurable roots
const ROOT = path.resolve(process.cwd());
const AUDIO_ROOT = path.join(ROOT, 'Canciones Vallenatas');
const COVERS_ROOT = path.join(ROOT, '1.2 CARATULAS LP-20251015T013115Z-1-001', '1.2 CARATULAS LP', 'CARATULAS 3');
const OUTPUT_DIR = path.join(ROOT, 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'library.json');
const OVERRIDES_FILE = path.join(OUTPUT_DIR, 'covers-map.json');

const GENRES = ['Merengues', 'Paseos', 'Puyas', 'Sones'];

function safeReadDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return [];
  }
}

function slugify(str) {
  return (str || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseAudioFilename(file) {
  const base = file.replace(/\.mp3$/i, '');
  // Limpieza preliminar de tags irrelevantes
  const cleaned = base
    .replace(/\b(Video Oficial|Video Letra|Letra Oficial|FULL AUDIO|Audio|Video)\b/gi, '')
    .replace(/\((?:Con Letra(?: HD)?|Cover Audio|Letra|Video|Audio)\)/gi, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/\s{2,}/g, ' ') // espacios duplicados
    .trim();

  // Patrones más precisos
  const patterns = [
    /^(?<artist>[^-]+?)\s*-\s*(?<title>[^-]+)$/i, // Artista - Titulo
    /^(?<title>[^,]+?),\s*(?<artist>[^-]+?)(?:\s*-.*)?$/i, // Titulo, Artista - resto
    /^(?<title>[^-]+?)\s*-\s*(?<artist>[^-]+)$/i, // Titulo - Artista
  ];
  for (const re of patterns) {
    const m = cleaned.match(re);
    if (m && m.groups) {
      return {
        title: tidy(m.groups.title),
        artist: tidy(m.groups.artist),
      };
    }
  }
  // Fallback genérico por separadores
  const parts = cleaned.split(/[-,]/).map(s => s.trim()).filter(Boolean);
  return {
    title: tidy(parts.length > 1 ? parts[1] : parts[0]),
    artist: tidy(parts.length > 1 ? parts[0] : 'Desconocido'),
  };
}

function tidy(str) {
  if (!str) return str;
  return str
    .replace(/^[_\-]+|[_\-]+$/g,'')
    .replace(/\s{2,}/g,' ')
    .replace(/\bmi\b/gi, 'Mi') // capitalización simple de 'mi'
    .replace(/\b(?:diomedes diaz)\b/gi, 'Diomedes Díaz')
    .replace(/\b(?:calle|h|hd|ay hombe+!?)/gi, '')
    .replace(/\s{2,}/g,' ') // limpiar otra vez
    .trim()
    .replace(/^\.+|\.+$/g,'');
}

function indexCovers() {
  const files = safeReadDir(COVERS_ROOT).filter(d => d.isFile() && /\.(jpe?g|png)$/i.test(d.name));
  const map = new Map();
  for (const f of files) {
    const base = f.name.replace(/\.(jpe?g|png)$/i, '');
    const s = slugify(base);
    map.set(s, path.join('1.2 CARATULAS LP-20251015T013115Z-1-001', '1.2 CARATULAS LP', 'CARATULAS 3', f.name));
  }
  return map;
}

function findCoverFor({ title, artist, id }, coverIndex, overrides) {
  if (overrides && overrides[id] && overrides[id].imageUrl) {
    return overrides[id].imageUrl;
  }
  // Scoring por solapamiento de tokens (artista pesa más)
  const artistTokens = (slugify(artist || '')).split(' ').filter(t => t.length >= 4);
  const titleTokens = (slugify(title || '')).split(' ').filter(t => t.length >= 5);

  let bestRel = null;
  let bestScore = 0;
  for (const [key, rel] of coverIndex.entries()) {
    let score = 0;
    for (const t of artistTokens) if (key.includes(t)) score += 2;
    for (const t of titleTokens) if (key.includes(t)) score += 1;
    if (score > bestScore) { bestScore = score; bestRel = rel; }
  }
  // Umbral mínimo: al menos un token de artista o 2 de título
  if (bestScore >= 2) return bestRel;
  return null;
}

function scan() {
  const coverIndex = indexCovers();
  let overrides = {};
  if (fs.existsSync(OVERRIDES_FILE)) {
    try { overrides = JSON.parse(fs.readFileSync(OVERRIDES_FILE,'utf8')); } catch {}
  }
  const items = [];
  for (const genre of GENRES) {
    const dir = path.join(AUDIO_ROOT, genre);
    for (const d of safeReadDir(dir)) {
      if (!d.isFile() || !/\.mp3$/i.test(d.name)) continue;
      const meta = parseAudioFilename(d.name);
      const relPath = path.join('Canciones Vallenatas', genre, d.name);
      const id = slugify(`${meta.artist || 'varios'}-${meta.title || d.name}`);
      const coverRel = findCoverFor({ ...meta, id }, coverIndex, overrides);
      const genreNormalized = genre.replace(/s$/,'').toLowerCase() === 'sone' ? 'Sone' : genre.replace(/s$/,'').slice(0,1).toUpperCase() + genre.replace(/s$/,'').slice(1);
      items.push({
        id,
        title: meta.title || tidy(d.name.replace(/\.mp3$/i, '')),
        artist: meta.artist || 'Desconocido',
        album: null,
        genre: genreNormalized,
        audioUrl: relPath.replace(/\\/g, '/'),
        imageUrl: coverRel ? coverRel.replace(/\\/g, '/') : null,
      });
    }
  }
  return items;
}

function main() {
  const items = scan();
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ updatedAt: new Date().toISOString(), count: items.length, items }, null, 2), 'utf8');
  console.log(`Wrote ${items.length} items to ${OUTPUT_FILE}`);
}

const invoked = (() => {
  try {
    return import.meta.url === pathToFileURL(process.argv[1]).href;
  } catch {
    // En Windows el formateo del file:// puede variar; por defecto ejecutamos.
    return true;
  }
})();
if (invoked) {
  main();
}
