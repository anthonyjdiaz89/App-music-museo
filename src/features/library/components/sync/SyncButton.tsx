import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../../../core/config/theme';

interface SyncButtonProps {
  busy: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ busy, onPress, disabled }) => {
  return (
    <TouchableOpacity 
      disabled={busy || disabled} 
      onPress={onPress} 
      style={[styles.syncButton, (busy || disabled) && styles.syncButtonBusy]}
      activeOpacity={0.8}
    >
      <Text style={styles.syncIcon}>↓</Text>
      <Text style={styles.syncText}>
        {busy ? 'Sincronizando...' : 'Sincronizar Audios'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});
