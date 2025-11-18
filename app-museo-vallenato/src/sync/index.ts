import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

const DIR = FileSystem.documentDirectory + 'library/';
const AUDIO_DIR = DIR + 'audio/';
const COVERS_DIR = DIR + 'covers/';
const LOCAL_LIBRARY_PATH = DIR + 'library.json';
const LOCAL_VERSION_PATH = DIR + 'version.json';

type Manifest = {
  version: number;
  generatedAt: number;
  albums: Array<{
    id: string; title: string; artist: string;
    coverFilename: string | null; coverUrl: string | null;
    coverSize: number | null; coverMD5: string | null;
  }>;
  tracks: Array<{
    id: string; title: string; artist: string; genre: string; albumId: string | null;
    audioFilename: string | null; audioUrl: string | null;
    audioSize: number | null; audioMD5: string | null;
  }>;
};

async function ensureDir(uri: string) {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
}

async function fileOk(localUri: string, expectedSize?: number | null) {
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) return false;
    if (expectedSize && info.size != null && info.size !== expectedSize) return false;
    return true;
  } catch { return false; }
}

export async function fetchManifest(): Promise<Manifest> {
  const url = Constants.expoConfig?.extra?.MANIFEST_URL;
  if (!url) throw new Error('MANIFEST_URL no configurada');
  const res = await fetch(url);
  if (!res.ok) throw new Error('No se pudo descargar el manifest');
  return res.json();
}

export async function syncLibrary(onProgress?: (msg: string) => void, options?: { cleanup?: boolean }) {
  await ensureDir(DIR); await ensureDir(AUDIO_DIR); await ensureDir(COVERS_DIR);
  const manifest = await fetchManifest();
  onProgress && onProgress(`Manifest v${manifest.version} con ${manifest.tracks.length} pistas`);

  // Índices de álbum para carátulas
  const albumById = new Map(manifest.albums.map(a => [a.id, a] as const));

  // Descargar carátulas necesarias
  const coverLocalMap = new Map<string, string>(); // coverFilename -> localUri
  for (const alb of manifest.albums) {
    if (!alb.coverFilename || !alb.coverUrl) continue;
    const dest = COVERS_DIR + alb.coverFilename;
    let need = !(await fileOk(dest, alb.coverSize));
    if (!need && alb.coverMD5) {
      try {
        const info = await FileSystem.getInfoAsync(dest, { md5: true } as any);
        const md5 = (info as any).md5 as string | undefined;
        if (md5 && md5 !== alb.coverMD5) need = true;
      } catch {}
    }
    if (need) {
      onProgress && onProgress(`Descargando carátula ${alb.coverFilename}`);
      await FileSystem.downloadAsync(alb.coverUrl, dest);
    }
    coverLocalMap.set(alb.coverFilename, dest);
  }

  // Descargar audios necesarios y construir library local
  const items = [] as any[];
  const neededAudios = new Set<string>();
  const neededCovers = new Set<string>();
  for (const t of manifest.tracks) {
    let localAudioPath: string | undefined = undefined;
    if (t.audioFilename && t.audioUrl) {
      const dest = AUDIO_DIR + t.audioFilename;
      let need = !(await fileOk(dest, t.audioSize));
      if (!need && t.audioMD5 && (t.audioSize || 0) < 100_000_000) {
        try {
          const info = await FileSystem.getInfoAsync(dest, { md5: true } as any);
          const md5 = (info as any).md5 as string | undefined;
          if (md5 && md5 !== t.audioMD5) need = true;
        } catch {}
      }
      if (need) {
        onProgress && onProgress(`Descargando audio ${t.title}`);
        await FileSystem.downloadAsync(t.audioUrl, dest);
      }
      localAudioPath = dest;
      neededAudios.add(t.audioFilename);
    }
    const album = t.albumId ? albumById.get(t.albumId) : null;
    const imageFilename = album?.coverFilename || null;
  const localImagePath = imageFilename ? coverLocalMap.get(imageFilename) : undefined;
  if (imageFilename) neededCovers.add(imageFilename);
    items.push({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: album?.title || null,
      genre: t.genre,
      audioUrl: t.audioFilename || '',
      imageUrl: imageFilename,
      localAudioPath,
      localImagePath,
      audioMD5: t.audioMD5 || undefined,
      imageMD5: album?.coverMD5 || undefined,
    });
  }

  await FileSystem.writeAsStringAsync(LOCAL_LIBRARY_PATH, JSON.stringify({ version: manifest.version, items }, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  await FileSystem.writeAsStringAsync(LOCAL_VERSION_PATH, JSON.stringify({ version: manifest.version, at: Date.now() }), { encoding: FileSystem.EncodingType.UTF8 });

  if (options?.cleanup) {
    try {
      const audioDir = await FileSystem.readDirectoryAsync(AUDIO_DIR);
      for (const f of audioDir) {
        if (!neededAudios.has(f)) {
          onProgress && onProgress(`Eliminando audio huérfano ${f}`);
          await FileSystem.deleteAsync(AUDIO_DIR + f, { idempotent: true });
        }
      }
      const coverDir = await FileSystem.readDirectoryAsync(COVERS_DIR);
      for (const f of coverDir) {
        if (!neededCovers.has(f)) {
          onProgress && onProgress(`Eliminando carátula huérfana ${f}`);
          await FileSystem.deleteAsync(COVERS_DIR + f, { idempotent: true });
        }
      }
    } catch {}
  }
  onProgress && onProgress(`Sincronización completa: ${items.length} pistas`);
  return { items };
}

export async function loadLocalLibrary(): Promise<null | { version?: number; items: any[] }> {
  try {
    const info = await FileSystem.getInfoAsync(LOCAL_LIBRARY_PATH);
    if (!info.exists) return null;
    const txt = await FileSystem.readAsStringAsync(LOCAL_LIBRARY_PATH);
    return JSON.parse(txt);
  } catch { return null; }
}

export async function getLocalVersion(): Promise<number | null> {
  try {
    const info = await FileSystem.getInfoAsync(LOCAL_VERSION_PATH);
    if (!info.exists) return null;
    const txt = await FileSystem.readAsStringAsync(LOCAL_VERSION_PATH);
    const data = JSON.parse(txt);
    return typeof data.version === 'number' ? data.version : null;
  } catch { return null; }
}
