import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import bundledLibrary from '../data/library.json';
import { audioMap } from '../../../../assets/audio/map';

const DIR = FileSystem.documentDirectory + 'library/';
const AUDIO_DIR = DIR + 'audio/';
const COVERS_DIR = DIR + 'covers/';
const LOCAL_LIBRARY_PATH = DIR + 'library.json';
const LOCAL_VERSION_PATH = DIR + 'version.json';
const BUNDLED_LIBRARY_VERSION = (bundledLibrary as any).version ?? 1;
const BUNDLED_LIBRARY_PAYLOAD = {
  version: BUNDLED_LIBRARY_VERSION,
  items: bundledLibrary.items,
};

type Manifest = {
  version: number;
  items: any[];
};

function assertNativeFileSystem() {
  if (Platform.OS === 'web') {
    // En web no usamos FileSystem, pero permitimos que la app cargue
    return;
  }
}

async function ensureDir(uri: string) {
  if (Platform.OS === 'web') return;
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) await FileSystem.makeDirectoryAsync(uri, { intermediates: true });
}

async function fileOk(localUri: string, expectedSize?: number | null) {
  if (Platform.OS === 'web') return true;
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) return false;
    if (expectedSize && info.size != null && info.size !== expectedSize) return false;
    return true;
  } catch { return false; }
}

async function writeBundledLibraryToDisk() {
  if (Platform.OS === 'web') {
    return BUNDLED_LIBRARY_PAYLOAD;
  }
  await ensureDir(DIR);
  await FileSystem.writeAsStringAsync(
    LOCAL_LIBRARY_PATH,
    JSON.stringify(BUNDLED_LIBRARY_PAYLOAD, null, 2),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
  await FileSystem.writeAsStringAsync(
    LOCAL_VERSION_PATH,
    JSON.stringify({ version: BUNDLED_LIBRARY_VERSION, at: Date.now(), source: 'bundle' }),
    { encoding: FileSystem.EncodingType.UTF8 }
  );
  return BUNDLED_LIBRARY_PAYLOAD;
}

export async function fetchManifest(): Promise<Manifest | null> {
  try {
    // 1. Obtener versión global
    const { data: versionData, error: versionError } = await supabase
      .from('catalog_version')
      .select('version')
      .single();
    
    if (versionError || !versionData) {
      console.log('Error fetching version or no version found:', versionError);
      return null;
    }

    // 2. Obtener todos los tracks
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*');

    if (tracksError || !tracks) {
      console.log('Error fetching tracks:', tracksError);
      return null;
    }

    return {
      version: versionData.version,
      items: tracks
    };
  } catch (e) {
    console.log('Error in fetchManifest:', e);
    return null;
  }
}

export async function syncLibrary(onProgress?: (msg: string) => void, options?: { cleanup?: boolean }) {
  if (Platform.OS === 'web') return { items: [] };
  
  await ensureDir(DIR); 
  await ensureDir(AUDIO_DIR); 
  await ensureDir(COVERS_DIR);

  const manifest = await fetchManifest();
  if (!manifest) throw new Error('No se pudo obtener el manifiesto de Supabase');

  onProgress && onProgress(`Catálogo v${manifest.version} con ${manifest.items.length} pistas`);

  const items = [] as any[];
  const neededAudios = new Set<string>();
  const neededCovers = new Set<string>();

  for (const t of manifest.items) {
    let localAudioPath: string | undefined = undefined;
    let localImagePath: string | undefined = undefined;

    // Lógica de Audio
    // Si está en el bundle (audioMap) y no ha cambiado (podríamos chequear MD5 si tuviéramos), usamos el bundle.
    // Pero si Supabase dice que hay un audioUrl (que asumimos es el nombre del archivo en storage o una URL completa),
    // y NO está en el bundle, O queremos forzar update, lo descargamos.
    
    // Simplificación: Si está en audioMap, asumimos que es el "base".
    // Si el servidor manda un audioUrl diferente o nuevo, lo descargamos.
    
    const isBundled = !!audioMap[t.id];
    const filename = t.audioUrl ? t.audioUrl.split('/').pop() : `${t.id}.mp3`;
    
    // Si NO está en bundle, o si queremos soportar actualizaciones de bundle, verificamos descarga.
    // Por ahora: Si está en bundle, NO descargamos (ahorra datos), a menos que la lógica de negocio cambie.
    // El usuario dijo: "Descarga todos los nuevos audios".
    
    if (!isBundled && t.audioUrl) {
      const dest = AUDIO_DIR + filename;
      // Aquí deberíamos usar t.audioUrl real (firmada si es storage privado)
      // Asumimos que t.audioUrl es accesible.
      
      // Si es una ruta relativa o nombre de archivo, necesitamos la URL base del Storage de Supabase
      let downloadUrl = t.audioUrl;
      if (!t.audioUrl.startsWith('http')) {
         // Construir URL pública de Supabase Storage si es solo nombre de archivo
         const { data } = supabase.storage.from('audios').getPublicUrl(t.audioUrl);
         downloadUrl = data.publicUrl;
      }

      let need = !(await fileOk(dest));
      // TODO: Verificar MD5/Size si viene de Supabase

      if (need) {
        onProgress && onProgress(`Descargando audio ${t.title}`);
        try {
            await FileSystem.downloadAsync(downloadUrl, dest);
            localAudioPath = dest;
        } catch (e) {
            console.error(`Error descargando ${t.title}`, e);
        }
      } else {
        localAudioPath = dest;
      }
      
      if (localAudioPath) neededAudios.add(filename);
    }

    // Lógica de Imagen (similar)
    if (t.imageUrl) {
        const imgFilename = t.imageUrl.split('/').pop() || `${t.id}.jpg`;
        const dest = COVERS_DIR + imgFilename;
        let downloadUrl = t.imageUrl;
        if (!t.imageUrl.startsWith('http')) {
            const { data } = supabase.storage.from('covers').getPublicUrl(t.imageUrl);
            downloadUrl = data.publicUrl;
        }

        let need = !(await fileOk(dest));
        if (need) {
            try {
                await FileSystem.downloadAsync(downloadUrl, dest);
                localImagePath = dest;
            } catch (e) {}
        } else {
            localImagePath = dest;
        }
        if (localImagePath) neededCovers.add(imgFilename);
    }

    items.push({
      ...t,
      localAudioPath, // Será undefined si usamos el del bundle
      localImagePath,
    });
  }

  // Guardar catálogo local actualizado
  await FileSystem.writeAsStringAsync(LOCAL_LIBRARY_PATH, JSON.stringify({ version: manifest.version, items }, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  await FileSystem.writeAsStringAsync(LOCAL_VERSION_PATH, JSON.stringify({ version: manifest.version, at: Date.now() }), { encoding: FileSystem.EncodingType.UTF8 });

  // Cleanup (opcional) - Eliminar archivos que ya no están en el catálogo actual
  if (options?.cleanup) {
      onProgress && onProgress('Limpiando archivos antiguos...');
      
      try {
          // Limpiar audios huérfanos
          const audioFiles = await FileSystem.readDirectoryAsync(AUDIO_DIR);
          for (const file of audioFiles) {
              if (!neededAudios.has(file)) {
                  await FileSystem.deleteAsync(AUDIO_DIR + file, { idempotent: true });
                  onProgress && onProgress(`Eliminado audio antiguo: ${file}`);
              }
          }

          // Limpiar covers huérfanas
          const coverFiles = await FileSystem.readDirectoryAsync(COVERS_DIR);
          for (const file of coverFiles) {
              if (!neededCovers.has(file)) {
                  await FileSystem.deleteAsync(COVERS_DIR + file, { idempotent: true });
                  onProgress && onProgress(`Eliminada carátula antigua: ${file}`);
              }
          }
      } catch (cleanupError) {
          console.error('Error durante cleanup:', cleanupError);
      }
  }

  onProgress && onProgress(`Sincronización completa`);
  return { items };
}

export async function loadLocalLibrary(): Promise<null | { version?: number; items: any[] }> {
  if (Platform.OS === 'web') {
    return BUNDLED_LIBRARY_PAYLOAD;
  }

  // Para builds sin sync remoto, siempre devolver el bundle directo
  // Los assets (audio/covers) se cargan vía require() maps, no FileSystem
  const ENABLE_REMOTE_SYNC = process.env.EXPO_PUBLIC_ENABLE_AUTO_SYNC === 'true';
  if (!ENABLE_REMOTE_SYNC) {
    console.log('[sync] Modo offline: usando catálogo empaquetado');
    return BUNDLED_LIBRARY_PAYLOAD;
  }

  try {
    const localVersion = await getLocalVersion();
    const needsSeedRefresh = localVersion == null || localVersion < BUNDLED_LIBRARY_VERSION;

    if (needsSeedRefresh) {
      console.log(`[sync] Refrescando catálogo local desde bundle (v${BUNDLED_LIBRARY_VERSION})...`);
      return await writeBundledLibraryToDisk();
    }

    const info = await FileSystem.getInfoAsync(LOCAL_LIBRARY_PATH);
    if (!info.exists) {
      return await writeBundledLibraryToDisk();
    }

    const txt = await FileSystem.readAsStringAsync(LOCAL_LIBRARY_PATH);
    const parsed = JSON.parse(txt);
    if (!parsed?.items?.length) {
      return await writeBundledLibraryToDisk();
    }

    return parsed;
  } catch (e) {
    console.error('Error loading local library:', e);
    return BUNDLED_LIBRARY_PAYLOAD;
  }
}

export async function getLocalVersion(): Promise<number | null> {
  if (Platform.OS === 'web') return BUNDLED_LIBRARY_VERSION;
  try {
    const info = await FileSystem.getInfoAsync(LOCAL_VERSION_PATH);
    if (!info.exists) {
      return null;
    }
    const txt = await FileSystem.readAsStringAsync(LOCAL_VERSION_PATH);
    const data = JSON.parse(txt);
    return typeof data.version === 'number' ? data.version : null;
  } catch {
    return null;
  }
}

