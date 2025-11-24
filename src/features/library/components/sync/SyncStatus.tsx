import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../../core/config/theme';

interface SyncStatusProps {
  status: string;
  logs: string[];
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ status, logs }) => {
  return (
    <>
      {/* Mensaje de estado */}
      {status ? (
        <View style={[styles.statusCard, status.includes('Error') && styles.statusCardError]}>
          <Text style={[styles.statusText, status.includes('Error') && styles.statusTextError]}>
            {status}
          </Text>
        </View>
      ) : null}

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
    </>
  );
};

const styles = StyleSheet.create({
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
