import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../../../core/config/theme';
import { formatTime } from '../../../../shared/utils/time';

interface PlayerProgressBarProps {
  position: number;
  duration: number;
}

export const PlayerProgressBar: React.FC<PlayerProgressBarProps> = ({ position, duration }) => {
  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.progressContainer}>
      <Text style={styles.timeText}>{formatTime(position)}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.timeText}>{formatTime(duration)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    width: 45,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff206e',
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff206e',
    marginLeft: -8,
  },
});
