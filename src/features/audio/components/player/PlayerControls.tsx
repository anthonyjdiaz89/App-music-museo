import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../../../core/config/theme";
import { PlaybackMode } from "../../AudioContext";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoaded: boolean;
  hasQueue: boolean;
  playbackMode: PlaybackMode;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onCycleMode: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isLoaded,
  hasQueue,
  playbackMode,
  onPlayPause,
  onNext,
  onPrevious,
  onSeekForward,
  onSeekBackward,
  onCycleMode,
}) => {
  const getPlaybackModeText = () => {
    switch (playbackMode) {
      case PlaybackMode.REPEAT_ONE:
        return "UNO";
      case PlaybackMode.REPEAT_ALL:
        return "TODO";
      case PlaybackMode.SHUFFLE:
        return "ALEA";
      default:
        return "OFF";
    }
  };

  const getPlaybackModeIcon = () => {
    switch (playbackMode) {
      case PlaybackMode.REPEAT_ONE:
        return "repeat";
      case PlaybackMode.REPEAT_ALL:
        return "repeat";
      case PlaybackMode.SHUFFLE:
        return "shuffle";
      default:
        return "arrow-forward";
    }
  };

  return (
    <View style={styles.allControlsContainer}>
      {/* Botón de modo de reproducción (OFF / UNO / TODO / ALEA) */}
      <TouchableOpacity style={styles.modeButton} onPress={onCycleMode}>
        <Ionicons name={getPlaybackModeIcon()} size={18} color="#ff206e" />
        <Text style={styles.modeText}>{getPlaybackModeText()}</Text>
      </TouchableOpacity>

      {/* Botón Retroceder 10s */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          !isLoaded && styles.controlButtonDisabled,
        ]}
        onPress={onSeekBackward}
        disabled={!isLoaded}
      >
        <Ionicons name="play-back" size={24} color="#ff206e" />
      </TouchableOpacity>

      {/* Botón Anterior */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          !hasQueue && styles.controlButtonDisabled,
        ]}
        onPress={onPrevious}
        disabled={!hasQueue}
      >
        <Ionicons name="play-skip-back" size={28} color="#ff206e" />
      </TouchableOpacity>

      {/* Botón de play principal (grande) */}
      <TouchableOpacity
        onPress={onPlayPause}
        style={[styles.playButton, !isLoaded && styles.playButtonDisabled]}
        disabled={!isLoaded}
        activeOpacity={0.8}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={48}
          color="#FFFFFF"
          style={{ marginLeft: isPlaying ? 0 : 4 }}
        />
      </TouchableOpacity>

      {/* Botón Siguiente */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          !hasQueue && styles.controlButtonDisabled,
        ]}
        onPress={onNext}
        disabled={!hasQueue}
      >
        <Ionicons name="play-skip-forward" size={28} color="#ff206e" />
      </TouchableOpacity>

      {/* Botón Avanzar 10s */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          !isLoaded && styles.controlButtonDisabled,
        ]}
        onPress={onSeekForward}
        disabled={!isLoaded}
      >
        <Ionicons name="play-forward" size={24} color="#ff206e" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  allControlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xl,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
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
    backgroundColor: "#ff206e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ff206e",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  modeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    width: 80,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "#ff206e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff206e",
  },
});
