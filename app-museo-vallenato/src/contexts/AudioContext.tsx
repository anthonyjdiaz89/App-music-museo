/**
 * AudioContext - Gestión global del estado de reproducción de audio
 * Usa AudioService centralizado para toda la lógica de audio
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Track } from '../types';
import AudioService, { PlaybackMode, AudioState } from '../services/AudioService';

interface AudioContextType extends AudioState {
  playTrack: (track: Track) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  setQueue: (tracks: Track[], startIndex?: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioService = AudioService.getInstance();
  const [state, setState] = useState<AudioState>(audioService.getState());

  // Suscribirse a cambios del servicio
  useEffect(() => {
    const unsubscribe = audioService.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [audioService]);

  // Cleanup cuando se desmonta la app
  useEffect(() => {
    return () => {
      audioService.destroy();
    };
  }, [audioService]);

  const contextValue: AudioContextType = {
    ...state,
    playTrack: (track: Track) => audioService.playTrack(track),
    play: () => audioService.play(),
    pause: () => audioService.pause(),
    togglePlayPause: () => audioService.togglePlayPause(),
    stop: () => audioService.stop(),
    seekTo: (position: number) => audioService.seekTo(position),
    playNext: () => audioService.playNext(),
    playPrevious: () => audioService.playPrevious(),
    setQueue: (tracks: Track[], startIndex?: number) => audioService.setQueue(tracks, startIndex),
    setPlaybackMode: (mode: PlaybackMode) => audioService.setPlaybackMode(mode),
  };

  return (
    <AudioContext.Provider value={contextValue}>
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

// Re-exportar tipos útiles
export { PlaybackMode } from '../services/AudioService';
