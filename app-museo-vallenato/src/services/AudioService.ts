/**
 * AudioService - Servicio centralizado para gestión de audio
 * Singleton que maneja toda la lógica de reproducción de audio
 */

import { Audio } from 'expo-av';
import { Track } from '../types';
import { audioMap } from '../../assets/audio/map';

export enum PlaybackMode {
  NORMAL = 'NORMAL',
  REPEAT_ONE = 'REPEAT_ONE',
  REPEAT_ALL = 'REPEAT_ALL',
  SHUFFLE = 'SHUFFLE',
}

export interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoaded: boolean;
  position: number;
  duration: number;
  error: string | null;
  playbackMode: PlaybackMode;
  queue: Track[];
  currentIndex: number;
}

type StateChangeListener = (state: AudioState) => void;

class AudioService {
  private static instance: AudioService;
  private sound: Audio.Sound | null = null;
  private state: AudioState = {
    currentTrack: null,
    isPlaying: false,
    isLoaded: false,
    position: 0,
    duration: 0,
    error: null,
    playbackMode: PlaybackMode.NORMAL,
    queue: [],
    currentIndex: -1,
  };
  private listeners: Set<StateChangeListener> = new Set();

  private constructor() {
    this.initializeAudio();
  }

  /**
   * Obtener instancia singleton del servicio
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Inicializar configuración de audio
   */
  private async initializeAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log('[AudioService] Audio initialized');
    } catch (error) {
      console.error('[AudioService] Error initializing audio:', error);
    }
  }

  /**
   * Suscribirse a cambios de estado
   */
  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    // Retornar función de desuscripción
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notificar a todos los listeners sobre cambios de estado
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  /**
   * Actualizar estado interno
   */
  private updateState(updates: Partial<AudioState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Obtener estado actual
   */
  public getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Cargar y reproducir un track
   */
  public async playTrack(track: Track, autoPlay: boolean = true): Promise<void> {
    try {
      // Detener audio actual si existe
      await this.cleanup();

      // Crear nuevo sonido
      const newSound = new Audio.Sound();

      // Configurar callback de actualización
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          this.updateState({
            position: status.positionMillis,
            duration: status.durationMillis || 0,
            isPlaying: status.isPlaying,
          });

          // Si terminó de reproducir, manejar siguiente track
          if (status.didJustFinish) {
            this.handleTrackFinished();
          }
        }
      });

      // Cargar el audio
      const audioSource = this.getAudioSource(track);
      await newSound.loadAsync(audioSource);

      this.sound = newSound;
      this.updateState({
        currentTrack: track,
        isLoaded: true,
        error: null,
      });

      // Reproducir si autoPlay está activado
      if (autoPlay) {
        await this.play();
      }

      console.log(`[AudioService] Track loaded: ${track.title}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[AudioService] Error loading track:', error);
      this.updateState({
        error: `Error al cargar el audio: ${errorMessage}`,
        isLoaded: false,
        isPlaying: false,
      });
      throw error;
    }
  }

  /**
   * Obtener fuente de audio para un track
   */
  private getAudioSource(track: Track) {
    if (track.localAudioPath) {
      return { uri: track.localAudioPath };
    }

    const audioFilename = audioMap[track.id];
    if (audioFilename) {
      const audioPath = audioFilename.replace('./', '');
      const audioUri = `/assets/audio/${audioPath}`;
      return { uri: audioUri };
    }

    if (/^https?:\/\//i.test(track.audioUrl)) {
      return { uri: track.audioUrl };
    }

    throw new Error('No audio source found for track');
  }

  /**
   * Reproducir audio
   */
  public async play(): Promise<void> {
    if (!this.sound || !this.state.isLoaded) {
      throw new Error('Audio no está listo para reproducir');
    }

    try {
      await this.sound.playAsync();
      this.updateState({ isPlaying: true, error: null });
      console.log('[AudioService] Playing');
    } catch (error) {
      console.error('[AudioService] Error playing:', error);
      this.updateState({ error: 'Error al reproducir' });
      throw error;
    }
  }

  /**
   * Pausar audio
   */
  public async pause(): Promise<void> {
    if (!this.sound || !this.state.isLoaded) {
      throw new Error('Audio no está listo para pausar');
    }

    try {
      await this.sound.pauseAsync();
      this.updateState({ isPlaying: false, error: null });
      console.log('[AudioService] Paused');
    } catch (error) {
      console.error('[AudioService] Error pausing:', error);
      this.updateState({ error: 'Error al pausar' });
      throw error;
    }
  }

  /**
   * Toggle play/pause
   */
  public async togglePlayPause(): Promise<void> {
    if (this.state.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * Detener y limpiar audio actual
   */
  public async stop(): Promise<void> {
    await this.cleanup();
    this.updateState({
      currentTrack: null,
      isPlaying: false,
      isLoaded: false,
      position: 0,
      duration: 0,
      error: null,
    });
    console.log('[AudioService] Stopped');
  }

  /**
   * Buscar a una posición específica (en milisegundos)
   */
  public async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound || !this.state.isLoaded) {
      throw new Error('Audio no está listo para buscar');
    }

    try {
      await this.sound.setPositionAsync(positionMillis);
      this.updateState({ position: positionMillis });
      console.log(`[AudioService] Seeked to ${positionMillis}ms`);
    } catch (error) {
      console.error('[AudioService] Error seeking:', error);
      throw error;
    }
  }

  /**
   * Configurar cola de reproducción
   */
  public setQueue(tracks: Track[], startIndex: number = 0): void {
    this.updateState({
      queue: tracks,
      currentIndex: startIndex,
    });
    console.log(`[AudioService] Queue set with ${tracks.length} tracks, starting at index ${startIndex}`);
  }

  /**
   * Reproducir siguiente track en la cola
   */
  public async playNext(): Promise<void> {
    const { queue, currentIndex, playbackMode } = this.state;

    if (queue.length === 0) {
      console.log('[AudioService] No queue available');
      return;
    }

    let nextIndex = currentIndex + 1;

    // Manejar modos de reproducción
    if (playbackMode === PlaybackMode.SHUFFLE) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (playbackMode === PlaybackMode.REPEAT_ALL) {
        nextIndex = 0;
      } else {
        console.log('[AudioService] End of queue');
        await this.stop();
        return;
      }
    }

    this.updateState({ currentIndex: nextIndex });
    await this.playTrack(queue[nextIndex]);
  }

  /**
   * Reproducir track anterior en la cola
   */
  public async playPrevious(): Promise<void> {
    const { queue, currentIndex, position } = this.state;

    if (queue.length === 0) {
      console.log('[AudioService] No queue available');
      return;
    }

    // Si llevamos más de 3 segundos, reiniciar el track actual
    if (position > 3000) {
      await this.seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;

    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    this.updateState({ currentIndex: prevIndex });
    await this.playTrack(queue[prevIndex]);
  }

  /**
   * Cambiar modo de reproducción
   */
  public setPlaybackMode(mode: PlaybackMode): void {
    this.updateState({ playbackMode: mode });
    console.log(`[AudioService] Playback mode set to ${mode}`);
  }

  /**
   * Manejar cuando un track termina de reproducirse
   */
  private async handleTrackFinished(): Promise<void> {
    const { playbackMode, currentTrack } = this.state;

    if (playbackMode === PlaybackMode.REPEAT_ONE && currentTrack) {
      // Repetir el mismo track
      await this.seekTo(0);
      await this.play();
    } else {
      // Reproducir siguiente
      await this.playNext();
    }
  }

  /**
   * Limpiar recursos de audio
   */
  private async cleanup(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('[AudioService] Error cleaning up:', error);
      }
    }
  }

  /**
   * Liberar todos los recursos (llamar al cerrar la app)
   */
  public async destroy(): Promise<void> {
    await this.cleanup();
    this.listeners.clear();
    console.log('[AudioService] Destroyed');
  }
}

export default AudioService;
