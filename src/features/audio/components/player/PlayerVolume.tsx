import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { spacing } from '../../../../core/config/theme';

interface PlayerVolumeProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const PlayerVolume: React.FC<PlayerVolumeProps> = ({ volume, onVolumeChange }) => {
  const getVolumeIcon = () => {
    if (volume === 0) return 'volume-mute';
    if (volume < 0.5) return 'volume-low';
    return 'volume-high';
  };

  const toggleMute = () => {
    onVolumeChange(volume === 0 ? 1.0 : 0);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMute} style={styles.iconButton}>
        <Ionicons name={getVolumeIcon()} size={24} color="#ff206e" />
      </TouchableOpacity>
      
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        onValueChange={onVolumeChange}
        minimumTrackTintColor="#ff206e"
        maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
        thumbTintColor="#ff206e"
      />
      
      <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  volumeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff206e',
    width: 45,
    textAlign: 'right',
  },
});
