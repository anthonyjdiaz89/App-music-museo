import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../../../core/config/theme";
import { getCoverSource } from "../../../../../assets/covers/coverMap";

interface PlayerCoverProps {
  trackId: string;
  pulseAnim: any;
  isSpeakerMode: boolean;
  onToggleSpeakerMode: () => void;
}

export const PlayerCover: React.FC<PlayerCoverProps> = ({
  trackId,
  pulseAnim,
  isSpeakerMode,
  onToggleSpeakerMode,
}) => {
  const coverSource = getCoverSource(trackId);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Ajustar tamaño de cover según orientación
  const coverSize = isLandscape ? Math.min(height * 0.5, 280) : 340;

  return (
    <View style={styles.visualContainer}>
      <Animated.View
        style={[
          styles.coverContainer,
          {
            width: coverSize,
            height: coverSize,
          },
          pulseAnim,
        ]}
      >
        {coverSource ? (
          <Image
            source={coverSource}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-note" size={120} color="#ff206e" />
          </View>
        )}
      </Animated.View>

      <TouchableOpacity
        style={styles.speakerButton}
        onPress={onToggleSpeakerMode}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isSpeakerMode ? "volume-high" : "volume-medium"}
          size={20}
          color="#FFFFFF"
        />
        <Text style={styles.speakerText}>
          {isSpeakerMode ? "Principal" : "Altavoz"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  visualContainer: {
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  coverContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 32, 110, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  speakerButton: {
    position: "absolute",
    bottom: -20,
    backgroundColor: "#4DD0E1",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  speakerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
