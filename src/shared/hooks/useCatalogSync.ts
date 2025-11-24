import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchManifest, getLocalVersion, syncLibrary } from '../../features/library/services/sync';

const LAST_SYNC_KEY = '@fonoteca/lastSync';
const MIN_SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos
const ENABLE_AUTO_SYNC = process.env.EXPO_PUBLIC_ENABLE_AUTO_SYNC === 'true';

interface SyncState {
  isSyncing: boolean;
  lastSyncDate: Date | null;
  error: string | null;
  progress: string | null;
}

export function useCatalogSync() {
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    lastSyncDate: null,
    error: null,
    progress: null,
  });

  const appState = useRef(AppState.currentState);
  const syncInProgress = useRef(false);

  // Cargar última fecha de sincronización
  const loadLastSyncDate = useCallback(async () => {
    try {
      const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
      if (timestamp) {
        setState(prev => ({ ...prev, lastSyncDate: new Date(parseInt(timestamp)) }));
      }
    } catch (e) {
      console.log('[useCatalogSync] Error loading last sync date:', e);
    }
  }, []);

  // Guardar última fecha de sincronización
  const saveLastSyncDate = useCallback(async () => {
    try {
      const now = Date.now();
      await AsyncStorage.setItem(LAST_SYNC_KEY, now.toString());
      setState(prev => ({ ...prev, lastSyncDate: new Date(now) }));
    } catch (e) {
      console.log('[useCatalogSync] Error saving last sync date:', e);
    }
  }, []);

  // Verificar si es necesario sincronizar
  const shouldSync = useCallback(async (): Promise<boolean> => {
    if (!ENABLE_AUTO_SYNC || Platform.OS === 'web') {
      return false;
    }

    // Verificar intervalo mínimo
    const lastSyncStr = await AsyncStorage.getItem(LAST_SYNC_KEY);
    if (lastSyncStr) {
      const lastSync = parseInt(lastSyncStr);
      const elapsed = Date.now() - lastSync;
      if (elapsed < MIN_SYNC_INTERVAL) {
        console.log(`[useCatalogSync] Última sincronización hace ${Math.floor(elapsed / 1000)}s, omitiendo`);
        return false;
      }
    }

    // Verificar si hay nueva versión remota
    try {
      const [remoteManifest, localVersion] = await Promise.all([
        fetchManifest(),
        getLocalVersion(),
      ]);

      if (!remoteManifest) {
        console.log('[useCatalogSync] No se pudo obtener manifiesto remoto');
        return false;
      }

      if (localVersion == null || remoteManifest.version > localVersion) {
        console.log(`[useCatalogSync] Nueva versión disponible: ${remoteManifest.version} > ${localVersion}`);
        return true;
      }

      console.log(`[useCatalogSync] Catálogo actualizado (v${localVersion})`);
      return false;
    } catch (e) {
      console.log('[useCatalogSync] Error verificando versión:', e);
      return false;
    }
  }, []);

  // Función principal de sincronización
  const syncCatalog = useCallback(async (force: boolean = false) => {
    if (syncInProgress.current) {
      console.log('[useCatalogSync] Sincronización ya en progreso');
      return;
    }

    if (!force && !ENABLE_AUTO_SYNC) {
      console.log('[useCatalogSync] Auto-sync deshabilitado');
      return;
    }

    if (!force && !(await shouldSync())) {
      return;
    }

    syncInProgress.current = true;
    setState(prev => ({ ...prev, isSyncing: true, error: null, progress: 'Iniciando...' }));

    try {
      console.log('[useCatalogSync] Iniciando sincronización...');
      
      await syncLibrary(
        (msg) => {
          console.log('[useCatalogSync]', msg);
          setState(prev => ({ ...prev, progress: msg }));
        },
        { cleanup: false }
      );

      await saveLastSyncDate();
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: null,
        progress: 'Completado',
      }));

      console.log('[useCatalogSync] Sincronización completada');
    } catch (e: any) {
      console.error('[useCatalogSync] Error en sincronización:', e);
      setState(prev => ({
        ...prev,
        isSyncing: false,
        error: e.message || 'Error desconocido',
        progress: null,
      }));
    } finally {
      syncInProgress.current = false;
    }
  }, [shouldSync, saveLastSyncDate]);

  // Auto-sync al montar
  useEffect(() => {
    loadLastSyncDate();
    
    if (ENABLE_AUTO_SYNC && Platform.OS !== 'web') {
      console.log('[useCatalogSync] Ejecutando auto-sync inicial');
      syncCatalog(false);
    }
  }, []);

  // Auto-sync al volver al foreground
  useEffect(() => {
    if (!ENABLE_AUTO_SYNC || Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useCatalogSync] App volvió al foreground, verificando sync');
        syncCatalog(false);
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [syncCatalog]);

  return {
    ...state,
    syncCatalog: () => syncCatalog(true), // Sync manual siempre forzado
    formatLastSync: () => {
      if (!state.lastSyncDate) return 'Nunca';
      
      const date = state.lastSyncDate;
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    },
  };
}
