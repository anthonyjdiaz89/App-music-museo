import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../../core/config/theme';

interface SyncHeaderProps {
  onBack: () => void;
}

export const SyncHeader: React.FC<SyncHeaderProps> = ({ onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>Sincronización de Audios</Text>
        <Text style={styles.headerSubtitle}>Gestión de contenido del museo</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
