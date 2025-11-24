import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../../core/config/theme';

interface SyncInfoProps {
  lastSync: string;
}

export const SyncInfo: React.FC<SyncInfoProps> = ({ lastSync }) => {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIcon}>
        <Text style={styles.infoIconText}>💾</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>Sincronización Automática</Text>
        <Text style={styles.infoDescription}>
          El catálogo se actualiza automáticamente. Use el botón para forzar actualización manual.
        </Text>
        {lastSync && lastSync !== 'Nunca' ? (
          <Text style={styles.lastSyncText}>
            📅 Catálogo actualizado el: {lastSync}
          </Text>
        ) : (
          <Text style={styles.lastSyncText}>
            📅 Catálogo actualizado el: Nunca
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
