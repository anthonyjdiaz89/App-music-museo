import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { spacing } from "../../../../core/config/theme";
import { useSharedValue } from "react-native-reanimated";

interface PlayerVolumeProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const PlayerVolume: React.FC<PlayerVolumeProps> = ({
  volume,
  onVolumeChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const getVolumeIcon = () => {
    if (volume === 0) return "volume-mute";
    if (volume < 0.5) return "volume-low";
    return "volume-high";
  };

  return (
    <View style={styles.wrapper}>
      {/* Botón que abre/cierra el control de volumen */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.iconButton}
      >
        <Ionicons name={getVolumeIcon()} size={20} color="#ff206e" />
      </TouchableOpacity>

      {/* Slider vertical real para ajustar el volumen */}
      {/* ERROR: este slider solo recibe gestos horizontales */}
      {/* TODO: implementar slider vertical con react-native-gesture-handler */}
      {expanded && (
        <View style={styles.floatingSlider}>
          <View style={styles.track}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={onVolumeChange}
              minimumTrackTintColor="transparent"
              maximumTrackTintColor="transparent"
              thumbTintColor="transparent"
            />
            <View
              pointerEvents="none"
              style={[styles.fill, { height: `${volume * 100}%` }]}
            />
            <View pointerEvents="none" style={styles.thumb} />
          </View>
          <Text style={styles.text}>{Math.round(volume * 100)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingSlider: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  slider: {
    width: 120,
    height: 120,
    top: 40,
  },
  track: {
    width: 10,
    height: 120,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ff206e",
  },
  thumb: {
    position: "absolute",
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff206e",
    borderWidth: 2,
    borderColor: "#fff",
  },
  text: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: "600",
    color: "#ff206e",
  },
});
