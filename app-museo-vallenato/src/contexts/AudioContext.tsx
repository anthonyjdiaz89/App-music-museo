/**
 * AudioContext - Gestión global del estado de reproducción de audio
 * Permite reproducción en segundo plano y control desde cualquier pantalla
 */

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Track } from '../types';
import { audioMap } from '../../assets/audio/map';

interface AudioContextType {
  currentTrack: Track | null;
  sound: Audio.Sound | null;
  isPlaying: boolean;
  isLoaded: boolean;
  position: number;
  duration: number;
  error: string | null;
  playTrack: (track: Track) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stopTrack: () => Promise<void>;
  setPosition: (position: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cleanup cuando se desmonta el componente
  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const playTrack = async (track: Track) => {
    try {
      // Si hay un sonido reproduciéndose, detenerlo primero
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Crear nuevo sonido
      const newSound = new Audio.Sound();
      
      // Cargar el audio
      if (track.localAudioPath) {
        await newSound.loadAsync({ uri: track.localAudioPath });
      } else {
        const audioFilename = audioMap[track.id];
        if (audioFilename) {
          const audioPath = audioFilename.replace('./', '');
          const audioUri = `/assets/audio/${audioPath}`;
          console.log(`[AudioContext] Loading audio: ${audioUri} for track ${track.id}`);
          await newSound.loadAsync({ uri: audioUri });
        } else if (/^https?:\/\//i.test(track.audioUrl)) {
          await newSound.loadAsync({ uri: track.audioUrl });
        } else {
          throw new Error('No audio source found');
        }
      }

      // Configurar callback de actualización
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
          
          // Si terminó de reproducir, resetear
          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
          }
        }
      });

      // Reproducir
      await newSound.playAsync();
      
      setSound(newSound);
      setCurrentTrack(track);
      setIsLoaded(true);
      setIsPlaying(true);
      setError(null);
      
      console.log(`[AudioContext] Playing track: ${track.title}`);
    } catch (e) {
      console.error('[AudioContext] Error playing track:', e);
      setError('Error al reproducir el audio');
      setIsLoaded(false);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound || !isLoaded) {
      setError('Audio no está listo');
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setError('Audio no cargado correctamente');
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (e) {
      console.error('[AudioContext] Error toggling play/pause:', e);
      setError('Error al controlar la reproducción');
    }
  };

  const stopTrack = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setCurrentTrack(null);
        setIsPlaying(false);
        setIsLoaded(false);
        setPosition(0);
        setDuration(0);
        setError(null);
      } catch (e) {
        console.error('[AudioContext] Error stopping track:', e);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        sound,
        isPlaying,
        isLoaded,
        position,
        duration,
        error,
        playTrack,
        togglePlayPause,
        stopTrack,
        setPosition,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
