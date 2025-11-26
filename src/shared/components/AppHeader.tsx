import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { palette, spacing } from "../../core/config/theme";

interface AppHeaderProps {
  trackCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ trackCount }) => {
  return (
    <View style={styles.header}>
      <Image
        source={require("../../../assets/figuras.png")}
        style={styles.headerPattern}
        resizeMode="cover"
      />

      <Image
        source={require("../../../assets/logo.png")}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <View style={styles.headerText}>
        <Text style={styles.headerTitle}>Archivo de Audio CCMV</Text>
        <Text style={styles.headerSubtitle}>
          Centro Cultural de la Música Vallenata
        </Text>
      </View>
      <Text style={styles.audioCount}>{trackCount} audios disponibles</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
    position: "relative",
  },
  headerPattern: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 180,
    opacity: 0.8,
  },
  headerLogo: {
    width: 50,
    height: 50,
    zIndex: 1,
    marginLeft: 190,
  },
  headerText: {
    flex: 1,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  audioCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    zIndex: 1,
  },
});
