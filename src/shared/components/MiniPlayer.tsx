import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Track } from "../../core/domain/types";
import { palette, spacing } from "../../core/config/theme";
import { useCoverSource } from "../hooks/useCoverSource";

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  position: number;
  duration: number;
  onPlayPause: () => void;
  onPress: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  track,
  isPlaying,
  position,
  duration,
  onPlayPause,
  onPress,
}) => {
  const progress = duration > 0 ? position / duration : 0;
  const coverSource = useCoverSource(track.id);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {coverSource ? (
          <Image source={coverSource} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-note" size={24} color={palette.primary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {track.artist}
          </Text>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={24}
            color="#FFFFFF"
            style={{ marginLeft: isPlaying ? 0 : 2 }}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: spacing.xl + 80,
    left: spacing.lg,
    width: 380,
    backgroundColor: "rgba(255, 32, 110, 0.95)",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  artist: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: spacing.xs,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  timeSeparator: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBar: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
});
