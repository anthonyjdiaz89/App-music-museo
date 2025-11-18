/**
 * PlayerScreen - Audio playback interface estilo kiosk
 * Diseño minimalista con controles grandes para pantallas táctiles
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import bundledLibrary from '../../assets/data/library.json';
import { Track } from '../types';
import { palette, typography, spacing } from '../theme';
import { audioMap } from '../../assets/audio/map';
import { loadLocalLibrary } from '../sync';
import { coverByTrackMap } from '../../assets/covers/trackMap';
import { useAudio, PlaybackMode } from '../contexts/AudioContext';

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
    playbackMode,
    queue,
    currentIndex,
    playTrack, 
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setQueue,
    setPlaybackMode,
  } = useAudio();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const localLib = await loadLocalLibrary();
      const allTracks = localLib?.items || bundledLibrary.items as Track[];
      const localTrack = allTracks.find((t: Track) => t.id === trackId);
      
      if (localTrack) {
        setTrack(localTrack);
      }
      
      // Configurar la cola completa de reproducción
      const currentTrackIndex = allTracks.findIndex((t: Track) => t.id === trackId);
      if (currentTrackIndex !== -1) {
        setQueue(allTracks, currentTrackIndex);
      }
      
      const current = localTrack || track;
      if (current && (!currentTrack || currentTrack.id !== trackId)) {
        // Solo reproducir si no es la misma canción que está sonando
        await playTrack(current);
      }
    })();
  }, [trackId]);

  // Funciones helper para controles avanzados
  const handleSeekForward = () => {
    const newPosition = Math.min(duration, position + 10000);
    seekTo(newPosition);
  };

  const handleSeekBackward = () => {
    const newPosition = Math.max(0, position - 10000);
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
      case PlaybackMode.REPEAT_ONE: return '🔂';
      case PlaybackMode.REPEAT_ALL: return '🔁';
      case PlaybackMode.SHUFFLE: return '🔀';
      default: return '→';
    }
  };

  const getPlaybackModeText = () => {
    switch (playbackMode) {
      case PlaybackMode.REPEAT_ONE: return 'UNO';
      case PlaybackMode.REPEAT_ALL: return 'TODO';
      case PlaybackMode.SHUFFLE: return 'ALEA';
      default: return 'OFF';
    }
  };

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
      {/* Fondo desenfocado con imagen de carátula */}
      {coverByTrackMap[track.id] ? (
        <>
          <ImageBackground 
            source={coverByTrackMap[track.id]} 
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={0}
          />
          <BlurView intensity={95} tint="dark" style={styles.blurOverlay} />
          <View style={styles.gradientOverlay} />
        </>
      ) : (
        <View style={styles.defaultBackground} />
      )}

      {/* Contenido sobre el fondo */}
      <View style={styles.contentContainer}>
        {/* Header con botón volver */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerStatus}>{isPlaying && currentTrack?.id === trackId ? 'Reproduciendo' : 'Detenido'}</Text>
            <Text style={styles.headerTitle}>Reproductor de Audio</Text>
          </View>
        </View>

        {/* Información de cola */}
        {queue.length > 0 && (
          <View style={styles.queueInfo}>
            <Text style={styles.queueText}>
              Pista {currentIndex + 1} de {queue.length}
            </Text>
          </View>
        )}

        {/* Carátula del álbum GRANDE */}
        <View style={styles.visualContainer}>
          <Animated.View style={[styles.coverContainer, { transform: [{ scale: pulseAnim }] }]}>
            {coverByTrackMap[track.id] ? (
              <Image 
                source={coverByTrackMap[track.id]} 
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <Ionicons name="musical-note" size={120} color="#ff206e" />
              </View>
            )}
          </Animated.View>

          {/* Botón altavoz/principal */}
          <TouchableOpacity 
            style={styles.speakerButton}
            onPress={() => setIsSpeakerMode(!isSpeakerMode)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isSpeakerMode ? "volume-high" : "volume-medium"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.speakerText}>
              {isSpeakerMode ? 'Principal' : 'Altavoz'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info del track */}
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={2}>{track.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{track.genre}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.description} numberOfLines={1}>{track.artist}</Text>
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

        {/* Controles unificados en una fila */}
        <View style={styles.allControlsContainer}>
          {/* Botón Retroceder 10s */}
          <TouchableOpacity 
            style={[styles.controlButton, !isLoaded && styles.controlButtonDisabled]}
            onPress={handleSeekBackward}
            disabled={!isLoaded}
          >
            <Ionicons name="play-back" size={24} color="#ff206e" />
          </TouchableOpacity>

          {/* Botón Anterior */}
          <TouchableOpacity 
            style={[styles.controlButton, queue.length === 0 && styles.controlButtonDisabled]}
            onPress={playPrevious}
            disabled={queue.length === 0}
          >
            <Ionicons name="play-skip-back" size={28} color="#ff206e" />
          </TouchableOpacity>

          {/* Botón de play principal (grande) */}
          <TouchableOpacity 
            onPress={togglePlayPause} 
            style={[styles.playButton, !isLoaded && styles.playButtonDisabled]}
            disabled={!isLoaded}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isPlaying && currentTrack?.id === trackId ? "pause" : "play"} 
              size={48} 
              color="#FFFFFF" 
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </TouchableOpacity>

          {/* Botón Siguiente */}
          <TouchableOpacity 
            style={[styles.controlButton, queue.length === 0 && styles.controlButtonDisabled]}
            onPress={playNext}
            disabled={queue.length === 0}
          >
            <Ionicons name="play-skip-forward" size={28} color="#ff206e" />
          </TouchableOpacity>

          {/* Botón Avanzar 10s */}
          <TouchableOpacity 
            style={[styles.controlButton, !isLoaded && styles.controlButtonDisabled]}
            onPress={handleSeekForward}
            disabled={!isLoaded}
          >
            <Ionicons name="play-forward" size={24} color="#ff206e" />
          </TouchableOpacity>
        </View>

        {/* Modo de reproducción */}
        <View style={styles.playbackModeContainer}>
          <TouchableOpacity 
            style={styles.modeButton}
            onPress={cyclePlaybackMode}
          >
          <Ionicons 
            name={
              playbackMode === PlaybackMode.REPEAT_ONE ? "repeat" :
              playbackMode === PlaybackMode.REPEAT_ALL ? "repeat" :
              playbackMode === PlaybackMode.SHUFFLE ? "shuffle" :
              "arrow-forward"
            }
            size={20} 
            color="#ff206e" 
          />
          <Text style={styles.modeText}>{getPlaybackModeText()}</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  defaultBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: palette.background,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  visualContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  coverContainer: {
    width: 340,
    height: 340,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 32, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
  speakerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  separator: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
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
  errorContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  errorText: {
    color: palette.error,
    fontSize: 14,
  },
  queueInfo: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  queueText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  allControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ff206e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff206e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playbackModeContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff206e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff206e',
  },
});
