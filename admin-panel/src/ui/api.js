let API_BASE = 'http://localhost:5050/api';

async function discoverApiBase() {
  // Intenta detectar el puerto real del backend (5050..5060)
  const ports = Array.from({ length: 11 }, (_, i) => 5050 + i);
  for (const p of ports) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 800);
      const res = await fetch(`http://localhost:${p}/api/ping`, { signal: ctrl.signal });
      clearTimeout(to);
      if (res.ok) {
        API_BASE = `http://localhost:${p}/api`;
        return API_BASE;
      }
    } catch { /* siguiente puerto */ }
  }
  return API_BASE;
}

async function req(path, options = {}) {
  // Asegura base descubierta la primera vez
  if (!req._baseReady) { await discoverApiBase(); req._baseReady = true; }
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type':'application/json', ...(options.headers||{}) },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const ct = res.headers.get('content-type')||'';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  getAlbums: () => req('/albums'),
  createAlbum: (data) => req('/albums', { method:'POST', body: JSON.stringify(data) }),
  updateAlbum: (id, data) => req(`/albums/${id}`, { method:'PUT', body: JSON.stringify(data) }),
  deleteAlbum: (id) => req(`/albums/${id}`, { method:'DELETE' }),
  importAlbums: (text) => req('/albums/import', { method:'POST', body: JSON.stringify({ text }) }),
  importAlbumCovers: (sourceDir) => req('/albums/import-covers', { method:'POST', body: JSON.stringify({ sourceDir }) }),
  getTracks: () => req('/tracks'),
  createTrack: (data) => req('/tracks', { method:'POST', body: JSON.stringify(data) }),
  updateTrack: (id, data) => req(`/tracks/${id}`, { method:'PUT', body: JSON.stringify(data) }),
  deleteTrack: (id) => req(`/tracks/${id}`, { method:'DELETE' }),
  generate: () => req('/generate', { method:'POST' }),
  getLibrary: () => req('/library'),
  uploadCover: async (file) => {
    const fd = new FormData(); fd.append('cover', file);
    const res = await fetch(API_BASE + '/upload/cover', { method:'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  uploadAudio: async (file) => {
    const fd = new FormData(); fd.append('audio', file);
    const res = await fetch(API_BASE + '/upload/audio', { method:'POST', body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
