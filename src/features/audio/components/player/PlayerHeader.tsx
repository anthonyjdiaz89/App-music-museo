import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../../../core/config/theme";

interface PlayerHeaderProps {
  isPlaying: boolean;
  onBack: () => void;
}

export const PlayerHeader: React.FC<PlayerHeaderProps> = ({
  isPlaying,
  onBack,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerStatus}>
          {isPlaying ? "Reproduciendo" : "Detenido"}
        </Text>
        <Text style={styles.headerTitle}>Reproductor de Audio</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    backgroundColor: "transparent",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerStatus: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
