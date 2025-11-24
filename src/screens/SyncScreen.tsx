/**
 * SyncScreen - Sincronización de audios estilo kiosk
 * Panel institucional con estadísticas y botón grande de sincronización
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { palette, spacing } from '../core/config/theme';
import { fetchManifest, getLocalVersion, loadLocalLibrary } from '../features/library/services/sync';
import bundledLibrary from '../../assets/data/library.json';
import { useCatalogSync } from '../shared/hooks/useCatalogSync';

const ENABLE_REMOTE_SYNC = process.env.EXPO_PUBLIC_ENABLE_AUTO_SYNC === 'true';

// Components
import { SyncHeader } from '../features/library/components/sync/SyncHeader';
import { SyncInfo } from '../features/library/components/sync/SyncInfo';
import { SyncButton } from '../features/library/components/sync/SyncButton';
import { SyncStats } from '../features/library/components/sync/SyncStats';
import { SyncStatus } from '../features/library/components/sync/SyncStatus';

export default function SyncScreen({ navigation }: any) {
  const [totalAudios, setTotalAudios] = useState(0);
  const [syncedAudios, setSyncedAudios] = useState(0);
  const [pendingAudios, setPendingAudios] = useState(0);
  
  const { 
    isSyncing, 
    lastSyncDate, 
    error, 
    progress, 
    syncCatalog, 
    formatLastSync 
  } = useCatalogSync();

  const logs: string[] = progress ? [progress] : error ? [`Error: ${error}`] : [];
  const status = isSyncing ? 'Sincronizando...' : error ? 'Error en sincronización' : '';

  useEffect(() => {
    loadStats();
  }, [isSyncing]); // Recargar stats después de sincronizar

  const loadStats = async () => {
    const local = Platform.OS === 'web' ? null : await loadLocalLibrary();
    const items = local?.items || bundledLibrary.items;
    const total = items.length;
    const synced = items.filter((t: any) => t.localAudioPath).length;
    const pending = total - synced;

    setTotalAudios(total);
    setSyncedAudios(synced);
    setPendingAudios(pending);
  };

  const run = useCallback(async() => {
    if (Platform.OS === 'web') {
      return;
    }
    if (!ENABLE_REMOTE_SYNC) {
      return;
    }
    await syncCatalog();
  }, [syncCatalog]);

  return (
    <View style={styles.container}>
      <SyncHeader onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <SyncInfo lastSync={formatLastSync()} />

        <SyncButton 
          busy={isSyncing} 
          onPress={run} 
          disabled={Platform.OS === 'web' || !ENABLE_REMOTE_SYNC} 
        />

        <SyncStats 
          total={totalAudios}
          synced={syncedAudios}
          pending={pendingAudios}
        />

        <SyncStatus status={status} logs={logs} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
});
