/**
 * SyncScreen - Sincronización de audios estilo kiosk
 * Panel institucional con estadísticas y botón grande de sincronización
 */

import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { palette, spacing } from '../theme';
import { syncLibrary, fetchManifest, getLocalVersion, loadLocalLibrary } from '../sync';
import bundledLibrary from '../../assets/data/library.json';

export default function SyncScreen({ navigation }: any) {
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [lastSync, setLastSync] = useState<string>('');
  const [totalAudios, setTotalAudios] = useState(0);
  const [syncedAudios, setSyncedAudios] = useState(0);
  const [pendingAudios, setPendingAudios] = useState(0);

  const log = useCallback((msg: string) => setLogs(prev => [...prev, msg]), []);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const local = await loadLocalLibrary();
    const items = local?.items || bundledLibrary.items;
    const total = items.length;
    const synced = items.filter((t: any) => t.localAudioPath).length;
    const pending = total - synced;

    setTotalAudios(total);
    setSyncedAudios(synced);
    setPendingAudios(pending);

    const localVer = await getLocalVersion();
    if (localVer) {
      setLastSync(new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
  };

  const run = useCallback(async() => {
    setBusy(true); setLogs([]); setStatus('');
    try {
      const remote = await fetchManifest();
      const local = await getLocalVersion();
      log(`Versión local: ${local ?? 'ninguna'} | remota: ${remote.version}`);
      await syncLibrary(log, { cleanup: false });
      setStatus(`Sincronización completada exitosamente`);
      await loadStats();
      setLastSync(new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    } catch (e: any) {
      setStatus('Error en la sincronización: ' + String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Sincronización de Audios</Text>
          <Text style={styles.headerSubtitle}>Gestión de contenido del museo</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de info de última sincronización */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>💾</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Listo para sincronizar</Text>
            <Text style={styles.infoDescription}>
              Pulse el botón para iniciar la sincronización manual
            </Text>
            {lastSync && (
              <Text style={styles.lastSyncText}>
                ⏰ Última sincronización: {lastSync}
              </Text>
            )}
          </View>
        </View>

        {/* Botón de sincronización principal */}
        <TouchableOpacity 
          disabled={busy} 
          onPress={run} 
          style={[styles.syncButton, busy && styles.syncButtonBusy]}
          activeOpacity={0.8}
        >
          <Text style={styles.syncIcon}>↓</Text>
          <Text style={styles.syncText}>
            {busy ? 'Sincronizando...' : 'Sincronizar Audios'}
          </Text>
        </TouchableOpacity>

        {/* Estadísticas en tarjetas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.15)' }]}>
              <Text style={styles.statIconText}>📁</Text>
            </View>
            <Text style={styles.statLabel}>Total Audios</Text>
            <Text style={styles.statValue}>{totalAudios}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.2)' }]}>
              <Text style={styles.statIconText}>✓</Text>
            </View>
            <Text style={styles.statLabel}>Sincronizados</Text>
            <Text style={styles.statValue}>{syncedAudios}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.25)' }]}>
              <Text style={styles.statIconText}>↻</Text>
            </View>
            <Text style={styles.statLabel}>Pendientes</Text>
            <Text style={styles.statValue}>{pendingAudios}</Text>
          </View>
        </View>

        {/* Mensaje de estado */}
        {status && (
          <View style={[styles.statusCard, status.includes('Error') && styles.statusCardError]}>
            <Text style={[styles.statusText, status.includes('Error') && styles.statusTextError]}>
              {status}
            </Text>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxIcon}>ℹ️</Text>
          <Text style={styles.infoBoxText}>
            La sincronización descarga contenido nuevo y actualiza los audios existentes. 
            Este proceso puede tardar varios minutos dependiendo de la conexión.
          </Text>
        </View>

        {/* Log de sincronización */}
        {logs.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.logTitle}>Registro de sincronización:</Text>
            <View style={styles.logBox}>
              {logs.map((l, i) => (
                <Text key={i} style={styles.logItem}>• {l}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: palette.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 32, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIconText: {
    fontSize: 28,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: palette.textSecondary,
    marginBottom: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: palette.textTertiary,
  },
  syncButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.lg + 4,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  syncButtonBusy: {
    opacity: 0.7,
  },
  syncIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  syncText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  statusCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusCardError: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
  },
  statusText: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
  },
  statusTextError: {
    color: '#F44336',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  infoBoxIcon: {
    fontSize: 20,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#2196F3',
    lineHeight: 18,
  },
  logContainer: {
    marginBottom: spacing.xl,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  logBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: spacing.md,
  },
  logItem: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});
