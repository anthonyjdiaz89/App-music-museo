/**
 * PlayerScreen - Audio playback interface estilo kiosk
 * Diseño minimalista con controles grandes para pantallas táctiles
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { Audio } from 'expo-av';
import bundledLibrary from '../../assets/data/library.json';
import { Track } from '../types';
import { palette, typography, spacing } from '../theme';
import { audioMap } from '../../assets/audio/map';
import { loadLocalLibrary } from '../sync';
import { coverByTrackMap } from '../../assets/covers/trackMap';
import { useAudio } from '../contexts/AudioContext';

interface PlayerScreenProps {
  route: {
    params: {
      trackId: string;
    };
  };
  navigation: any;
}

export default function PlayerScreen({ route, navigation }: PlayerScreenProps) {
  const { trackId } = route.params;
  const [track, setTrack] = useState<Track | undefined>(() => 
    (bundledLibrary.items as Track[]).find(t => t.id === trackId)
  );
  const [isSpeakerMode, setIsSpeakerMode] = useState(false);
  
  const { 
    currentTrack, 
    isPlaying, 
    isLoaded, 
    position, 
    duration, 
    error, 
    playTrack, 
    togglePlayPause 
  } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const localLib = await loadLocalLibrary();
      const localTrack = localLib?.items?.find((t: Track) => t.id === trackId);
      if (localTrack) {
        setTrack(localTrack);
      }
      
      const current = localTrack || track;
      if (current && (!currentTrack || currentTrack.id !== trackId)) {
        // Solo reproducir si no es la misma canción que está sonando
        await playTrack(current);
      }
    })();
  }, [trackId]);

  // Animación de pulso cuando está reproduciendo
  useEffect(() => {
    if (isPlaying && currentTrack?.id === trackId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, currentTrack, trackId]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  if (!track) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pista no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con botón volver */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerStatus}>{isPlaying && currentTrack?.id === trackId ? 'Reproduciendo' : 'Detenido'}</Text>
          <Text style={styles.headerTitle}>Reproductor de Audio</Text>
        </View>
      </View>

      {/* Carátula del álbum o icono de auriculares */}
      <View style={styles.visualContainer}>
        <Animated.View style={[styles.headphoneFrame, { transform: [{ scale: pulseAnim }] }]}>
          {coverByTrackMap[track.id] ? (
            <Image 
              source={coverByTrackMap[track.id]} 
              style={styles.coverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headphoneIcon}>
              <Text style={styles.headphoneText}>🎧</Text>
            </View>
          )}
        </Animated.View>

        {/* Botón altavoz/principal */}
        <TouchableOpacity 
          style={styles.speakerButton}
          onPress={() => setIsSpeakerMode(!isSpeakerMode)}
          activeOpacity={0.7}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
          <Text style={styles.speakerText}>
            {isSpeakerMode ? 'Principal' : 'Altavoz'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info del track */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{track.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{track.genre}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.description}>{track.artist}</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Mensaje de error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Controles */}
      <View style={styles.controlsContainer}>
        {/* Botón de pausa (pequeño) */}
        <TouchableOpacity style={styles.stopButton} disabled={!isLoaded}>
          <Text style={styles.stopIcon}>⏸</Text>
        </TouchableOpacity>

        {/* Botón de play principal (grande) */}
        <TouchableOpacity 
          onPress={togglePlayPause} 
          style={[styles.playButton, !isLoaded && styles.playButtonDisabled]}
          disabled={!isLoaded}
          activeOpacity={0.8}
        >
          <Text style={styles.playIcon}>{isPlaying && currentTrack?.id === trackId ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        {/* Toggle de repetición */}
        <TouchableOpacity style={styles.loopButton}>
          <Text style={styles.loopIcon}>🔄</Text>
          <Text style={styles.loopText}>OFF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#2C2C2C',
  },
  headerStatus: {
    fontSize: 12,
    color: '#888',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  visualContainer: {
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
    marginBottom: spacing.xxl,
  },
  headphoneFrame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#FFB84D',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headphoneIcon: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headphoneText: {
    fontSize: 120,
  },
  coverImage: {
    width: 180,
    height: 180,
    borderRadius: 16,
  },
  speakerButton: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#4DD0E1',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  speakerIcon: {
    fontSize: 18,
  },
  speakerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  separator: {
    fontSize: 16,
    color: '#CCC',
  },
  description: {
    fontSize: 16,
    color: '#888',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    width: 45,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
    borderRadius: 3,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: palette.primary,
    marginLeft: -8,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  errorText: {
    color: palette.error,
    fontSize: 14,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxl * 2,
    gap: spacing.xl,
  },
  stopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    fontSize: 24,
    color: '#666',
  },
  playButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playIcon: {
    fontSize: 40,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  loopButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loopIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  loopText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
});
