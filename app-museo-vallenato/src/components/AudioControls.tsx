/**
 * AudioControls - Componente de ejemplo con controles completos
 * Demuestra el uso avanzado del AudioService
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudio, PlaybackMode } from '../contexts/AudioContext';
import { palette, spacing } from '../theme';

export default function AudioControls() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    playbackMode,
    queue,
    currentIndex,
    togglePlayPause,
    playNext,
    playPrevious,
    setPlaybackMode,
    seekTo,
  } = useAudio();

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekBackward = () => {
    const newPosition = Math.max(0, position - 10000); // Retroceder 10 segundos
    seekTo(newPosition);
  };

  const handleSeekForward = () => {
    const newPosition = Math.min(duration, position + 10000); // Avanzar 10 segundos
    seekTo(newPosition);
  };

  const cyclePlaybackMode = () => {
    const modes = [
      PlaybackMode.NORMAL,
      PlaybackMode.REPEAT_ONE,
      PlaybackMode.REPEAT_ALL,
      PlaybackMode.SHUFFLE,
    ];
    const currentModeIndex = modes.indexOf(playbackMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlaybackMode(nextMode);
  };

  const getPlaybackModeIcon = () => {
    switch (playbackMode) {
      case PlaybackMode.REPEAT_ONE:
        return '🔂';
      case PlaybackMode.REPEAT_ALL:
        return '🔁';
      case PlaybackMode.SHUFFLE:
        return '🔀';
      default:
        return '→';
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  if (!currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTrackText}>No hay audio reproduciéndose</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
        {queue.length > 0 && (
          <Text style={styles.queueInfo}>
            {currentIndex + 1} de {queue.length} en cola
          </Text>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Main Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={playPrevious}
          disabled={queue.length === 0}
        >
          <Text style={styles.controlIcon}>⏮️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSeekBackward}
        >
          <Text style={styles.controlIcon}>⏪</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton]}
          onPress={togglePlayPause}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSeekForward}
        >
          <Text style={styles.controlIcon}>⏩</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={playNext}
          disabled={queue.length === 0}
        >
          <Text style={styles.controlIcon}>⏭️</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary Controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={cyclePlaybackMode}
        >
          <Text style={styles.modeIcon}>{getPlaybackModeIcon()}</Text>
          <Text style={styles.modeText}>
            {playbackMode === PlaybackMode.NORMAL && 'Normal'}
            {playbackMode === PlaybackMode.REPEAT_ONE && 'Repetir 1'}
            {playbackMode === PlaybackMode.REPEAT_ALL && 'Repetir Todo'}
            {playbackMode === PlaybackMode.SHUFFLE && 'Aleatorio'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: palette.background,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noTrackText: {
    textAlign: 'center',
    color: palette.textSecondary,
    fontSize: 16,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  trackArtist: {
    fontSize: 16,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  queueInfo: {
    fontSize: 12,
    color: palette.textSecondary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    color: palette.textSecondary,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  controlButton: {
    padding: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  controlIcon: {
    fontSize: 28,
  },
  playButton: {
    backgroundColor: palette.primary,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  playIcon: {
    fontSize: 40,
  },
  secondaryControls: {
    alignItems: 'center',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  modeIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  modeText: {
    fontSize: 14,
    color: palette.textPrimary,
  },
});
