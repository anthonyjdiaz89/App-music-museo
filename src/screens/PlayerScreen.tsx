/**
 * PlayerScreen - Audio playback interface estilo kiosk
 * Diseño minimalista con controles grandes para pantallas táctiles
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import bundledLibrary from "../../assets/data/library.json";
import { Genre, Track } from "../core/domain/types";
import { palette, shadows, spacing } from "../core/config/theme";
import { useAudio, PlaybackMode } from "../features/audio/AudioContext";

import { getCoverSource } from "../../assets/covers/coverMap";

// Components
import { PlayerHeader } from "../features/audio/components/player/PlayerHeader";
import { PlayerCover } from "../features/audio/components/player/PlayerCover";
import { PlayerInfo } from "../features/audio/components/player/PlayerInfo";
import { PlayerProgressBar } from "../features/audio/components/player/PlayerProgressBar";
import { PlayerControls } from "../features/audio/components/player/PlayerControls";
import { PlayerVolume } from "../features/audio/components/player/PlayerVolume";
import { usePulseAnimation } from "@src/shared/animations/usePulseAnimation";
import { useLibrary } from "@src/features/library/hooks/useLibrary";

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
    (bundledLibrary.items as Track[]).find((t) => t.id === trackId)
  );
  const [isSpeakerMode, setIsSpeakerMode] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

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
    volume,
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setQueue,
    setPlaybackMode,
    setVolume,
  } = useAudio();

  const { items: rawLibraryItems, loading } = useLibrary();
  const normalizedItems = useMemo(
    () =>
      (loading ? bundledLibrary.items : rawLibraryItems).map((t) => ({
        ...t,
        genre: t.genre as Genre,
      })),
    [loading, rawLibraryItems]
  );

  useEffect(() => {
    if (loading) return;

    const localTrack = normalizedItems.find((t) => t.id === trackId);
    if (!localTrack) return;

    setTrack(localTrack);

    const currentTrackIndex = normalizedItems.findIndex(
      (t) => t.id === trackId
    );
    if (currentTrackIndex !== -1) setQueue(normalizedItems, currentTrackIndex);

    const shouldPlay =
      !currentTrack || currentTrack.id !== localTrack.id || !isLoaded;

    if (shouldPlay) playTrack(localTrack);
  }, [loading, trackId, normalizedItems]);

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

  // Animación de pulso cuando está reproduciendo
  const pulseAnim = usePulseAnimation(isPlaying ? 1.04 : 1); // se reutiliza el hook

  if (!track && !currentTrack) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pista no encontrada</Text>
      </View>
    );
  }

  const effectiveTrack = currentTrack || track;
  const coverSource = effectiveTrack ? getCoverSource(effectiveTrack.id) : null;

  return (
    <View style={styles.container}>
      {/* Fondo desenfocado con imagen de carátula */}
      {coverSource ? (
        <>
          <ImageBackground
            source={coverSource}
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
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape && styles.scrollContentLandscape,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <PlayerHeader
          isPlaying={isPlaying && !!currentTrack}
          onBack={() => navigation.goBack()}
        />

        {/* Información de cola */}
        {queue.length > 0 && (
          <View style={styles.queueInfo}>
            <Text style={styles.queueText}>
              Pista {currentIndex + 1} de {queue.length}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.mainContent,
            isLandscape && styles.mainContentLandscape,
          ]}
        >
          <View style={isLandscape ? styles.leftColumn : undefined}>
            {effectiveTrack && (
              <PlayerCover
                trackId={effectiveTrack.id}
                pulseAnim={pulseAnim}
                isSpeakerMode={isSpeakerMode}
                onToggleSpeakerMode={() => setIsSpeakerMode(!isSpeakerMode)}
              />
            )}
          </View>

          <View style={isLandscape ? styles.rightColumn : undefined}>
            {effectiveTrack && <PlayerInfo track={effectiveTrack} />}

            <View style={styles.progressRow}>
              <View style={styles.progressSection}>
                <PlayerProgressBar
                  position={position}
                  duration={duration}
                  onSeek={seekTo}
                />
              </View>

              <View style={styles.timelineVolumeContainer}>
                <PlayerVolume volume={volume} onVolumeChange={setVolume} />
              </View>
            </View>

            {/* Mensaje de error */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.controlsRow}>
              <PlayerControls
                isPlaying={isPlaying}
                isLoaded={isLoaded}
                hasQueue={!!queue.length}
                playbackMode={playbackMode}
                onPlayPause={togglePlayPause}
                onNext={playNext}
                onPrevious={playPrevious}
                onSeekForward={handleSeekForward}
                onSeekBackward={handleSeekBackward}
                onCycleMode={cyclePlaybackMode}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  blurOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  defaultBackground: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: palette.background,
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContentLandscape: {
    paddingHorizontal: spacing.xl,
  },
  mainContent: {
    flex: 1,
  },
  mainContentLandscape: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: spacing.lg,
  },
  leftColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rightColumn: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  progressRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: spacing.lg,
  },
  progressSection: {
    flex: 1,
  },
  timelineVolumeContainer: {
    marginLeft: spacing.lg,
  },
  controlsRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  errorText: {
    color: palette.error,
    fontSize: 14,
  },
  queueInfo: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    backgroundColor: "transparent",
  },
  queueText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
});
