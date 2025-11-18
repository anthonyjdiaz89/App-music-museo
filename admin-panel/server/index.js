/**
 * Admin Panel API Server
 * Provides REST endpoints for managing music library (albums, tracks)
 * and syncing assets to the Expo mobile application.
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const UPLOADS_DIR = path.join(ROOT, 'uploads');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');
const COVERS_DIR = path.join(UPLOADS_DIR, 'covers');

const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');

const DEFAULT_PORT = 5050;
const JSON_SIZE_LIMIT = '20mb';

// Ensure required directories exist
for (const p of [DATA_DIR, UPLOADS_DIR, AUDIO_DIR, COVERS_DIR]) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const app = express();
app.use(cors());
app.use(express.json({ limit: JSON_SIZE_LIMIT }));

app.use('/uploads/audio', express.static(AUDIO_DIR));
app.use('/uploads/covers', express.static(COVERS_DIR));

/**
 * Health check endpoint for port auto-detection
 * @route GET /api/ping
 */
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, port: Number((req.headers.host||'').split(':')[1]) || null });
});

/**
 * Reads JSON data file with error handling
 * @param {string} file - Absolute path to JSON file
 * @returns {Array} Parsed JSON array or empty array on error
 */
function readJson(file) {
  try { 
    return JSON.parse(fs.readFileSync(file, 'utf8') || '[]'); 
  } catch { 
    return []; 
  }
}

/**
 * Writes JSON data to file
 * @param {string} file - Absolute path to JSON file
 * @param {any} data - Data to serialize
 */
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Multer storage configuration for file uploads
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = file.fieldname === 'cover' ? COVERS_DIR : AUDIO_DIR;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    let name = file.originalname.replace(/\s+$/,'');
    const dest = file.fieldname === 'cover' ? COVERS_DIR : AUDIO_DIR;
    const full = path.join(dest, name);
    
    if (fs.existsSync(full)) {
      const ext = path.extname(name);
      const base = path.basename(name, ext);
      name = `${base}-${Date.now()}${ext}`;
    }
    cb(null, name);
  }
});
const upload = multer({ storage });

/**
 * Upload album cover image
 * @route POST /api/upload/cover
 */
app.post('/api/upload/cover', upload.single('cover'), (req, res) => {
  res.json({ filename: req.file.filename, url: `/uploads/covers/${req.file.filename}` });
});

/**
 * Upload track audio file
 * @route POST /api/upload/audio
 */
app.post('/api/upload/audio', upload.single('audio'), (req, res) => {
  res.json({ filename: req.file.filename, url: `/uploads/audio/${req.file.filename}` });
});

/**
 * Get all albums
 * @route GET /api/albums
 */
app.get('/api/albums', (req, res) => {
  res.json(readJson(ALBUMS_FILE));
});

/**
 * Create new album
 * @route POST /api/albums
 */
app.post('/api/albums', (req, res) => {
  const albums = readJson(ALBUMS_FILE);
  const id = 'alb_' + Math.random().toString(36).slice(2, 9);
  const { title, artist, coverFilename, year, description, caratulaNumber } = req.body;
  const album = {
    id,
    title,
    artist,
    coverFilename: coverFilename || null,
    year: year || null,
    description: description || null,
    caratulaNumber: caratulaNumber || null,
  };
  albums.push(album);
  writeJson(ALBUMS_FILE, albums);
  res.json(album);
});

/**
 * Update album by ID
 * @route PUT /api/albums/:id
 */
app.put('/api/albums/:id', (req, res) => {
  const albums = readJson(ALBUMS_FILE);
  const idx = albums.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  albums[idx] = { ...albums[idx], ...req.body };
  writeJson(ALBUMS_FILE, albums);
  res.json(albums[idx]);
});

/**
 * Delete album by ID
 * @route DELETE /api/albums/:id
 */
app.delete('/api/albums/:id', (req, res) => {
  const albums = readJson(ALBUMS_FILE).filter(a => a.id !== req.params.id);
  writeJson(ALBUMS_FILE, albums);
  
  const tracks = readJson(TRACKS_FILE).map(t => 
    t.albumId === req.params.id ? { ...t, albumId: null } : t
  );
  writeJson(TRACKS_FILE, tracks);
  res.json({ ok: true });
});

/**
 * Bulk import albums from pasted text
 * Supports two formats:
 * 1. CARÁTULA N / NOMBRE LP: ... / AÑO: ... / DESCRIPCION: ...
 * 2. CARÁTULA N / Nombre / Año / Artista - Descripción
 * @route POST /api/albums/import
 */
app.post('/api/albums/import', (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text requerido' });
    const albums = readJson(ALBUMS_FILE);

    const blocks = text.split(/\n\s*CAR[AÁ]TULA\s+/i).map((b, idx) => idx === 0 ? b : 'CARÁTULA ' + b).filter(b => /CAR[AÁ]TULA\s+\d+/i.test(b));
    let created = [];
    for (const block of blocks) {
      const numMatch = block.match(/CAR[AÁ]TULA\s+(\d+)/i);
      // Aceptar dos formatos: "NOMBRE LP: titulo" o "CARÁTULA N / Nombre / Año / Artista - Descripción"
      const slashParts = block.split('/').map(s => s.trim());
      const titleMatch = block.match(/NOMBRE\s+LP\s*:\s*(.+)/i) || (slashParts.length > 1 ? { 1: slashParts[1] } : null);
      const yearMatch = block.match(/AÑO\s*:\s*([^\n]+)/i) || (slashParts.length > 2 ? { 1: slashParts[2] } : null);
      const descMatch = block.match(/DESCRIPCION\s*:\s*([\s\S]+)/i) || (slashParts.length > 3 ? { 1: slashParts[3] } : null);
      const caratulaNumber = numMatch ? parseInt(numMatch[1], 10) : null;
      const title = titleMatch ? titleMatch[1].trim() : `LP ${caratulaNumber || ''}`.trim();
      const year = yearMatch ? yearMatch[1].trim() : null;
      const description = descMatch ? descMatch[1].trim() : null;

      // Heurística para artista: si descripción tiene " - ", el artista viene antes del guion
      let artist = 'Varios';
      const desc = description || '';
      if (desc.includes(' - ')) {
        artist = desc.split(' - ')[0].trim();
      } else {
        // Heurística simple desde descripción
        const d = desc.toUpperCase();
        if (d.includes('DIOMEDES')) artist = 'Diomedes Díaz';
        else if (d.includes('RAFAEL OROZCO')) artist = 'Rafael Orozco';
        else if (d.includes('JORGE OÑATE')) artist = 'Jorge Oñate';
        else if (d.includes('HERMANOS ZULETA') || d.includes('HERMANOS ZULETAS')) artist = 'Hermanos Zuleta';
        else if (d.includes('BINOMIO DE ORO')) artist = 'Binomio de Oro';
      }

      const id = 'alb_' + Math.random().toString(36).slice(2, 9);
      const album = { id, title, artist, coverFilename: null, year, description, caratulaNumber };
      albums.push(album);
      created.push(album);
    }
    writeJson(ALBUMS_FILE, albums);
    res.json({ ok: true, created: created.length, albums: created });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Get all tracks
 * @route GET /api/tracks
 */
app.get('/api/tracks', (req, res) => {
  res.json(readJson(TRACKS_FILE));
});

/**
 * Create new track
 * @route POST /api/tracks
 */
app.post('/api/tracks', (req, res) => {
  const tracks = readJson(TRACKS_FILE);
  const id = 'trk_' + Math.random().toString(36).slice(2, 9);
  const { title, artist, genre, albumId, audioFilename } = req.body;
  const track = { id, title, artist, genre, albumId: albumId || null, audioFilename };
  tracks.push(track);
  writeJson(TRACKS_FILE, tracks);
  res.json(track);
});

/**
 * Update track by ID
 * @route PUT /api/tracks/:id
 */
app.put('/api/tracks/:id', (req, res) => {
  const tracks = readJson(TRACKS_FILE);
  const idx = tracks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  tracks[idx] = { ...tracks[idx], ...req.body };
  writeJson(TRACKS_FILE, tracks);
  res.json(tracks[idx]);
});

/**
 * Delete track by ID
 * @route DELETE /api/tracks/:id
 */
app.delete('/api/tracks/:id', (req, res) => {
  const tracks = readJson(TRACKS_FILE).filter(t => t.id !== req.params.id);
  writeJson(TRACKS_FILE, tracks);
  res.json({ ok: true });
});

/**
 * Generate assets for the Expo mobile app
 * Copies covers/audio to app directory and creates TypeScript maps
 * @route POST /api/generate
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { pathToFileURL } = require('url');
    const { spawnSync } = require('child_process');
    const scriptPath = path.join(ROOT, 'tools', 'generateAssets.mjs');
    let mod;
    try {
      mod = await import(pathToFileURL(scriptPath).href);
    } catch (errImport) {
      const exec = spawnSync(process.execPath, ['--experimental-modules', scriptPath], { env: process.env, cwd: ROOT, encoding: 'utf8' });
      if (exec.error) throw exec.error;
      if (exec.status !== 0) throw new Error(exec.stderr || 'Error ejecutando generateAssets.mjs');
      try {
        const parsed = JSON.parse(exec.stdout.trim());
        return res.json({ ok: true, ...parsed, via: 'spawn' });
      } catch (eParse) {
        throw new Error('No se pudo parsear salida JSON del fallback spawn: ' + eParse);
      }
    }
    const result = await mod.generate();
    res.json({ ok: true, ...result });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Get library data for mobile app
 * Reads generated library.json or builds fallback from albums/tracks
 * @route GET /api/library
 */
app.get('/api/library', (req, res) => {
  try {
    const appLibraryPath = path.resolve(ROOT, '..', 'app-museo-vallenato', 'assets', 'data', 'library.json');
    if (!fs.existsSync(appLibraryPath)) {
      // Fallback: construir desde albums/tracks en formato esperado
      const albums = readJson(ALBUMS_FILE);
      const tracks = readJson(TRACKS_FILE);
      const items = tracks.map(t => {
        const album = albums.find(a => a.id === t.albumId) || null;
        return {
          id: t.id,
          title: t.title,
          artist: t.artist,
          album: album ? album.title : null,
          genre: t.genre,
          audioUrl: t.audioFilename ? t.audioFilename : '',
          imageUrl: album && album.coverFilename ? album.coverFilename : null,
        };
      });
      return res.json({ items, source: 'fallback' });
    }
    const data = JSON.parse(fs.readFileSync(appLibraryPath, 'utf8'));
    return res.json({ ...(typeof data === 'object' ? data : {}), source: 'app-assets' });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Generate file metadata (size and MD5 hash)
 * @param {string} fullPath - Absolute path to file
 * @returns {{size: number, md5: string} | null}
 */
function fileMeta(fullPath) {
  try {
    const stat = fs.statSync(fullPath);
    const size = stat.size;
    // Hash MD5 (rápido para verificación básica en cliente Expo)
    const hash = crypto.createHash('md5');
    const buf = fs.readFileSync(fullPath);
    hash.update(buf);
    const md5 = hash.digest('hex');
    return { size, md5 };
  } catch {
    return null;
  }
}

/**
 * Generate manifest for tablet synchronization
 * Includes all albums and tracks with file metadata and download URLs
 * @route GET /api/manifest
 */
app.get('/api/manifest', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const albums = readJson(ALBUMS_FILE);
  const tracks = readJson(TRACKS_FILE);

  const albumsOut = albums.map(a => {
    const coverPath = a.coverFilename ? path.join(COVERS_DIR, a.coverFilename) : null;
    const meta = coverPath ? fileMeta(coverPath) : null;
    return {
      id: a.id,
      title: a.title,
      artist: a.artist,
      coverFilename: a.coverFilename || null,
      coverUrl: a.coverFilename ? `${base}/uploads/covers/${encodeURIComponent(a.coverFilename)}` : null,
      coverSize: meta ? meta.size : null,
      coverMD5: meta ? meta.md5 : null,
      updatedAt: fs.existsSync(coverPath || '') ? fs.statSync(coverPath).mtimeMs : null,
    };
  });

  const tracksOut = tracks.map(t => {
    const audioPath = t.audioFilename ? path.join(AUDIO_DIR, t.audioFilename) : null;
    const meta = audioPath ? fileMeta(audioPath) : null;
    return {
      id: t.id,
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      albumId: t.albumId || null,
      audioFilename: t.audioFilename || null,
      audioUrl: t.audioFilename ? `${base}/uploads/audio/${encodeURIComponent(t.audioFilename)}` : null,
      audioSize: meta ? meta.size : null,
      audioMD5: meta ? meta.md5 : null,
      updatedAt: fs.existsSync(audioPath || '') ? fs.statSync(audioPath).mtimeMs : Date.now(),
    };
  });

  res.json({
    generatedAt: Date.now(),
    albums: albumsOut,
    tracks: tracksOut,
    version: Math.max(
      0,
      ...albumsOut.map(a => a.updatedAt || 0),
      ...tracksOut.map(t => t.updatedAt || 0)
    )
  });
});

/**
 * Import album covers from external directory
 * Maps cover files to albums by caratulaNumber with optional folder offsets
 * @route POST /api/albums/import-covers
 * @param {string} sourceDir - Source directory to scan for cover images
 * @param {boolean} recursive - Recursively scan subdirectories (default: true)
 * @param {boolean} overwrite - Overwrite existing covers (default: true)
 * @param {Object} folderOffsets - Mapping of folder names to number offsets
 * @example folderOffsets: { "CARATULAS 2": 100, "CARATULAS 3": 200 }
 */
app.post('/api/albums/import-covers', async (req, res) => {
  try {
  let sourceDir = req.body?.sourceDir || path.resolve(ROOT, '..');
  const recursive = req.body?.recursive !== false; // por defecto true
  const overwrite = req.body?.overwrite !== false; // por defecto true
  // Nuevo: mapeo de carpetas a offsets de numeración
  // Ejemplo: { "CARATULAS  1": 0, "CARATULAS 2": 100, "CARATULAS 3": 200, "CARATULAS 4": 300 }
  const folderOffsets = req.body?.folderOffsets || {};
    // Normalizar separadores en Windows si viene con backslashes escapados
    if (/^[A-Za-z]:\\/.test(sourceDir)) {
      sourceDir = sourceDir.replace(/\\+/g, '\\');
    }
    if (!fs.existsSync(sourceDir)) return res.status(400).json({ error: 'sourceDir no existe', sourceDir });

    // Recolectar todos los archivos de imagen (opcionalmente recursivo)
    function collectImages(dir) {
      const out = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          if (recursive) out.push(...collectImages(full));
        } else if (/\.(jpe?g|png)$/i.test(ent.name)) {
          out.push(full);
        }
      }
      return out;
    }

    const allFiles = collectImages(sourceDir);
    // Mapear por número de carátula según el nombre base + offset de carpeta
    const byNumber = new Map();
    for (const full of allFiles) {
      const base = path.basename(full);
      const dir = path.dirname(full);
      const folderName = path.basename(dir);
      
      const m = base.match(/^(\d+)\s*[\.|\-|_|\s]/); // número al inicio seguido de punto, guión, guión bajo o espacio
      if (!m) continue;
      const fileNum = parseInt(m[1], 10);
      
      // Aplicar offset si la carpeta está en folderOffsets
      const offset = folderOffsets[folderName] !== undefined ? folderOffsets[folderName] : 0;
      const finalNum = fileNum + offset;
      
      if (!byNumber.has(finalNum)) byNumber.set(finalNum, []);
      byNumber.get(finalNum).push({ full, base, dir, folderName, fileNum, offset, finalNum });
    }

    // Si no hay offsets, usar preferencia de carpetas (comportamiento original)
    if (Object.keys(folderOffsets).length === 0) {
      // Preferir carpetas con nombre 'CARATULAS  1', luego 2,3,4
      function preferenceScore(p) {
        const s = p.toUpperCase();
        const m = s.match(/CARATULAS\s*(\d)/);
        if (m) return Number(m[1]);
        return 99;
      }
      for (const [num, list] of byNumber.entries()) {
        list.sort((a, b) => preferenceScore(a.dir) - preferenceScore(b.dir));
      }
    }

    const albums = readJson(ALBUMS_FILE);
    let copied = 0, updated = 0, conflicts = [], unmatched = [];
    for (const album of albums) {
      if (!album.caratulaNumber) continue;
      const list = byNumber.get(album.caratulaNumber) || [];
      if (!list.length) { unmatched.push(album.caratulaNumber); continue; }
      const choice = list[0];
      const srcPath = choice.full;
      const destName = choice.base; // conservar nombre original
      const destPath = path.join(COVERS_DIR, destName);
      try {
        if (!fs.existsSync(destPath) || overwrite) {
          // asegurar directorio destino
          if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
          fs.copyFileSync(srcPath, destPath);
          copied++;
        }
        if (!album.coverFilename || overwrite) {
          album.coverFilename = destName;
          updated++;
        }
      } catch (e) {
        conflicts.push({ number: album.caratulaNumber, file: path.basename(srcPath), error: String(e) });
      }
    }
    writeJson(ALBUMS_FILE, albums);
    res.json({ ok: true, sourceDir, files: allFiles.length, mapped: copied, updated, unmatched: [...new Set(unmatched)].sort(), conflicts, usedOffsets: Object.keys(folderOffsets).length > 0 });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

/**
 * Find an available port starting from a given port number
 * @param {number} startPort - Starting port to check
 * @returns {Promise<number>} Available port number
 */
function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tryPort = (p) => {
      const tester = net.createServer()
        .once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            tryPort(p + 1);
          } else {
            reject(err);
          }
        })
        .once('listening', () => {
          tester.close(() => resolve(p));
        })
        .listen(p, '0.0.0.0');
    };
    tryPort(startPort);
  });
}

(async () => {
  const desired = Number(process.env.PORT) || DEFAULT_PORT;
  const port = await findAvailablePort(desired);
  app.listen(port, () => {
    const message = port !== desired 
      ? `Admin API running on http://localhost:${port} (port ${desired} was in use)`
      : `Admin API running on http://localhost:${port}`;
    console.log(message);
  });
})();
