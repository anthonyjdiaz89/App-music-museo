import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { spacing } from '../../../../core/config/theme';

interface PlayerVolumeProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const PlayerVolume: React.FC<PlayerVolumeProps> = ({ volume, onVolumeChange }) => {
  const [expanded, setExpanded] = useState(false);

  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-mute';
    if (volume < 0.5) return 'volume-low';
    return 'volume-high';
  };

  const toggleMute = () => {
    onVolumeChange(volume === 0 ? 1.0 : 0);
  };

  return (
    <View style={styles.wrapper}>
      {/* Botón que abre/cierra el control de volumen */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.iconButton}
      >
        <Ionicons name={getVolumeIcon()} size={20} color="#ff206e" />
      </TouchableOpacity>

      {/* Slider vertical real para ajustar el volumen */}
      {expanded && (
        <View style={styles.verticalSliderContainer}>
          <View style={styles.verticalTrack}>
            <Slider
              style={styles.verticalSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="transparent"
            />
            <View
              pointerEvents="none"
              style={[styles.verticalFill, { height: `${volume * 100}%` }]}
            />
            <View
              pointerEvents="none"
              style={styles.verticalThumb}
            />
          </View>
          <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verticalSliderContainer: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  verticalSlider: {
    position: 'absolute',
    width: 40,
    height: 120,
  },
  verticalTrack: {
    width: 10,
    height: 120,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  verticalFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#ff206e',
  },
  verticalThumb: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ff206e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  volumeText: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
    color: '#ff206e',
  },
});
