import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { spacing } from "../../../../core/config/theme";
import { Track } from "../../../../core/domain/types";

interface PlayerInfoProps {
  track: Track;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({ track }) => {
  return (
    <View style={styles.infoContainer}>
      <Text style={styles.title} numberOfLines={2}>
        {track.title}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.category}>{track.genre}</Text>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.description} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  category: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
  separator: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.4)",
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
  },
});
