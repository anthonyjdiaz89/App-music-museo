#!/usr/bin/env node
import http from 'http';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const MEDIA_ROOT = path.join(ROOT, 'Canciones Vallenatas');
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;

const MIME = {
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  });
  if (body) res.end(body); else res.end();
}

const server = http.createServer((req, res) => {
  if (!req.url) return send(res, 400, 'Bad Request');
  if (req.method === 'OPTIONS') return send(res, 204, '');

  // Decode and normalize path
  const urlPath = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '');
  const filePath = path.join(MEDIA_ROOT, urlPath);

  // Prevent path traversal
  if (!filePath.startsWith(MEDIA_ROOT)) {
    return send(res, 403, 'Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, 'Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Media server running at http://localhost:${PORT}/`);
  console.log(`Serving directory: ${MEDIA_ROOT}`);
  console.log('Example path: Merengues/Diomedes Diaz - El Cambio.mp3');
});
