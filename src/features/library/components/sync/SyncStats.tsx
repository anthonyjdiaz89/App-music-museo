import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../../core/config/theme';

interface SyncStatsProps {
  total: number;
  synced: number;
  pending: number;
}

export const SyncStats: React.FC<SyncStatsProps> = ({ total, synced, pending }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.15)' }]}>
          <Text style={styles.statIconText}>📁</Text>
        </View>
        <Text style={styles.statLabel}>Total Audios</Text>
        <Text style={styles.statValue}>{total}</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.2)' }]}>
          <Text style={styles.statIconText}>✓</Text>
        </View>
        <Text style={styles.statLabel}>Sincronizados</Text>
        <Text style={styles.statValue}>{synced}</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 32, 110, 0.25)' }]}>
          <Text style={styles.statIconText}>↻</Text>
        </View>
        <Text style={styles.statLabel}>Pendientes</Text>
        <Text style={styles.statValue}>{pending}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
