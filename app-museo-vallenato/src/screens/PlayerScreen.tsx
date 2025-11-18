/**
 * PlayerScreen - Audio playback interface
 * Supports offline playback with locally cached audio files
 * Falls back to bundled library if local library not available
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import bundledLibrary from '../../assets/data/library.json';
import { Track } from '../types';
import { palette, typography, spacing, borderRadius } from '../theme';
import { audioMap } from '../../assets/audio/map';
import { loadLocalLibrary } from '../sync';

interface PlayerScreenProps {
  route: {
    params: {
      trackId: string;
    };
  };
}

export default function PlayerScreen({ route }: PlayerScreenProps) {
  const { trackId } = route.params;
  const [track, setTrack] = useState<Track | undefined>(() => 
    (bundledLibrary.items as Track[]).find(t => t.id === trackId)
  );
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    
    (async () => {
      const localLib = await loadLocalLibrary();
      const localTrack = localLib?.items?.find((t: Track) => t.id === trackId);
      if (localTrack) setTrack(localTrack);
      
      const current = localTrack || track;
      if (!current) return;
      
      const s = new Audio.Sound();
      try {
        if (current.localAudioPath) {
          await s.loadAsync({ uri: current.localAudioPath });
        } else {
          const audioFilename = audioMap[current.id];
          if (audioFilename) {
            const audioPath = audioFilename.replace('./', '');
            // For web, use absolute path from public directory
            const audioUri = `/assets/audio/${audioPath}`;
            console.log(`[PlayerScreen] Loading audio: ${audioUri} for track ${current.id}`);
            await s.loadAsync({ uri: audioUri });
          } else if (/^https?:\/\//i.test(current.audioUrl)) {
            await s.loadAsync({ uri: current.audioUrl });
          } else {
            console.error(`[PlayerScreen] No audio source found for track ${current.id}`);
            setError('Audio no disponible offline');
            return;
          }
        }
        
        if (active) {
          setSound(s);
          setLoaded(true);
          setError(null); // Clear any previous errors
          console.log(`[PlayerScreen] Audio loaded successfully for track ${current.id}`);
        }
      } catch (e) {
        console.error(`[PlayerScreen] Error loading audio for track ${current.id}:`, e);
        if (active) {
          setError(`Error al cargar el audio: ${e instanceof Error ? e.message : 'Desconocido'}`);
        }
      }
    })();
    
    return () => { 
      active = false; 
      sound?.unloadAsync(); 
    };
  }, [trackId]);

  async function toggle() {
    if (!sound || !loaded) {
      setError('Audio no está listo');
      return;
    }
    
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) {
      setError('Audio no cargado correctamente');
      return;
    }
    
    if (playing) {
      await sound.pauseAsync();
      setPlaying(false);
    } else {
      await sound.playAsync();
      setPlaying(true);
    }
  }

  if (!track) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pista no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.artist}>{track.artist}</Text>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <TouchableOpacity 
        onPress={toggle} 
        style={[styles.button, !loaded && styles.buttonDisabled]}
        disabled={!loaded}
      >
        <Text style={styles.buttonText}>
          {playing ? 'Pausar' : 'Reproducir'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.heading,
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  artist: {
    ...typography.subheading,
    color: palette.textSecondary,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: palette.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.button,
    color: '#FFFFFF',
  },
  errorText: {
    color: palette.error,
    marginBottom: spacing.md,
  },
});
