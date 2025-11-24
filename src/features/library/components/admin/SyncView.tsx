import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { palette, spacing, typography } from '../../../../core/config/theme';
import { getLocalVersion, fetchManifest, syncLibrary } from '../../services/sync';
import { Ionicons } from '@expo/vector-icons';

export default function SyncView() {
  const [localVersion, setLocalVersion] = useState<number | null>(null);
  const [remoteVersion, setRemoteVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [withCleanup, setWithCleanup] = useState(false);

  useEffect(() => {
    checkVersions();
  }, []);

  const checkVersions = async () => {
    setLoading(true);
    try {
      const local = await getLocalVersion();
      setLocalVersion(local);

      const manifest = await fetchManifest();
      if (manifest) {
        setRemoteVersion(manifest.version);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSync = async () => {
    setSyncing(true);
    setLogs([]);
    addLog('Iniciando sincronización...');
    
    try {
      await syncLibrary((msg) => {
        addLog(msg);
      }, { cleanup: withCleanup });
      addLog('Sincronización finalizada con éxito.');
      checkVersions(); // Refresh versions
      Alert.alert('Éxito', 'La biblioteca se ha sincronizado correctamente.');
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      Alert.alert('Error', 'Hubo un problema durante la sincronización.');
    } finally {
      setSyncing(false);
    }
  };

  const isOutdated = localVersion !== null && remoteVersion !== null && remoteVersion > localVersion;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Estado de la Biblioteca</Text>
        
        {loading ? (
          <ActivityIndicator color={palette.primary} />
        ) : (
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Versión Local</Text>
              <Text style={styles.statusValue}>{localVersion ?? 'N/A'}</Text>
            </View>
            
            <Ionicons name="arrow-forward" size={24} color={palette.textTertiary} />
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Versión Nube</Text>
              <Text style={styles.statusValue}>{remoteVersion ?? 'N/A'}</Text>
            </View>
          </View>
        )}

        <View style={styles.statusMessage}>
            {isOutdated ? (
                <View style={[styles.badge, { backgroundColor: palette.warning }]}>
                    <Ionicons name="alert-circle" size={16} color="#FFF" />
                    <Text style={styles.badgeText}>Actualización Disponible</Text>
                </View>
            ) : (
                <View style={[styles.badge, { backgroundColor: palette.success }]}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                    <Text style={styles.badgeText}>Sincronizado</Text>
                </View>
            )}
        </View>

        <TouchableOpacity 
            style={[styles.cleanupToggle, withCleanup && styles.cleanupToggleActive]}
            onPress={() => setWithCleanup(!withCleanup)}
        >
            <Ionicons 
                name={withCleanup ? "checkbox" : "square-outline"} 
                size={20} 
                color={withCleanup ? palette.primary : palette.textSecondary} 
            />
            <Text style={[styles.cleanupText, withCleanup && styles.cleanupTextActive]}>
                Limpiar archivos antiguos
            </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.syncBtn, syncing && { opacity: 0.7 }]} 
            onPress={handleSync}
            disabled={syncing || loading}
        >
            {syncing ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <>
                    <Ionicons name="cloud-download" size={20} color="#FFF" />
                    <Text style={styles.syncBtnText}>SINCRONIZAR AHORA</Text>
                </>
            )}
        </TouchableOpacity>
      </View>

      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Registro de Actividad</Text>
        <ScrollView style={styles.logsScroll}>
            {logs.length === 0 ? (
                <Text style={styles.emptyLogs}>No hay actividad reciente.</Text>
            ) : (
                logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>{log}</Text>
                ))
            )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xl,
  },
  card: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: palette.primary,
  },
  statusMessage: {
    marginBottom: spacing.lg,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: spacing.xs,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  cleanupToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  cleanupToggleActive: {
    // No additional styles needed, just for future use
  },
  cleanupText: {
    color: palette.textSecondary,
    fontSize: 14,
  },
  cleanupTextActive: {
    color: palette.textPrimary,
    fontWeight: '600',
  },
  syncBtn: {
    flexDirection: 'row',
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignItems: 'center',
    gap: spacing.sm,
    width: '100%',
    justifyContent: 'center',
  },
  syncBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: 12,
  },
  logsScroll: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 8,
    padding: spacing.md,
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 4,
  },
  emptyLogs: {
    color: palette.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
