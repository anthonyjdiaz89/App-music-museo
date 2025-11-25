/**
 * PlayerScreen - Audio playback interface estilo kiosk
 * Diseño minimalista con controles grandes para pantallas táctiles
 */

import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ImageBackground,
  useWindowDimensions,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import bundledLibrary from "../../assets/data/library.json";
import { Track } from "../core/domain/types";
import { palette, spacing } from "../core/config/theme";
import { loadLocalLibrary } from "../features/library/services/sync";
import { useAudio, PlaybackMode } from "../features/audio/AudioContext";

// Mapa de require() para web/iOS
const coverRequireMap: Record<string, any> = {
  "3._DE_FRENTE_JSC_3542.JPG": require("../../assets/covers/3._DE_FRENTE_JSC_3542.JPG"),
  "4._DOS_GRANDES_JSC_3544.JPG": require("../../assets/covers/4._DOS_GRANDES_JSC_3544.JPG"),
  "11._GANO_EL_FOLCLOR_JSC_3565.JPG": require("../../assets/covers/11._GANO_EL_FOLCLOR_JSC_3565.JPG"),
  "14._MI_VIDA_MUSICAL_JSC_3572.JPG": require("../../assets/covers/14._MI_VIDA_MUSICAL_JSC_3572.JPG"),
  "17._UN_CANTO_CELESTIAL_JSC_3582.JPG": require("../../assets/covers/17._UN_CANTO_CELESTIAL_JSC_3582.JPG"),
  "20_ADELANTE_JSC_3596.JPG": require("../../assets/covers/20_ADELANTE_JSC_3596.JPG"),
  "22._POR_LO_ALTO_JSC_3600.JPG": require("../../assets/covers/22._POR_LO_ALTO_JSC_3600.JPG"),
  "39.FESTIVAL_VALLENATO_JSC_3653.JPG": require("../../assets/covers/39.FESTIVAL_VALLENATO_JSC_3653.JPG"),
  "66._NACI_PARA_CANTAR_JSC_3741.JPG": require("../../assets/covers/66._NACI_PARA_CANTAR_JSC_3741.JPG"),
  "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG": require("../../assets/covers/74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG"),
  "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG": require("../../assets/covers/77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG"),
};

// Mapeo de track IDs a nombres de archivo
const coverFileMap: Record<string, string> = {
  trk_0djxswp: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_3q49o4t: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_zv6nwrm: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_epxzpbi: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_xnqbvmp: "3._DE_FRENTE_JSC_3542.JPG",
  trk_7gspukd: "3._DE_FRENTE_JSC_3542.JPG",
  trk_phebo90: "14._MI_VIDA_MUSICAL_JSC_3572.JPG",
  trk_093fsoh: "3._DE_FRENTE_JSC_3542.JPG",
  trk_fbzkhi1: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_y4rw3p2: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_aqk4er2: "11._GANO_EL_FOLCLOR_JSC_3565.JPG",
  trk_aymzuem: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_5vrpb3o: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_eoc2vb8: "3._DE_FRENTE_JSC_3542.JPG",
  trk_qt11oxl: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_4dlxprq: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_vokmo7t: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_zmxwq4h: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_loeydq0: "11._GANO_EL_FOLCLOR_JSC_3565.JPG",
  trk_ntalu2v: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_x97c44q: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_afovlx1: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_sgltzb7: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_7rduj03: "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG",
  trk_fxez35t: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_i4y06kv: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_gn1tr7b: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_3iozs2o: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_22imsu2: "22._POR_LO_ALTO_JSC_3600.JPG",
  trk_3ljtrwl: "77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG",
  trk_cw3njdp: "3._DE_FRENTE_JSC_3542.JPG",
  trk_z2kfzfu: "4._DOS_GRANDES_JSC_3544.JPG",
  trk_fgw4y5b: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_838gqzm: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_u9vwbj3: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_2d66dvr: "20_ADELANTE_JSC_3596.JPG",
  trk_l9mpsff: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_pyuh3rd: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_xeznr2i: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_3j9ilp7: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_sp0uchh: "17._UN_CANTO_CELESTIAL_JSC_3582.JPG",
  trk_jsmh1n3: "3._DE_FRENTE_JSC_3542.JPG",
  trk_dtso3kj: "20_ADELANTE_JSC_3596.JPG",
  trk_mffy227: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_yk29ggp: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_xb5cnjy: "3._DE_FRENTE_JSC_3542.JPG",
  trk_f0a62em: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_r8t2li2: "39.FESTIVAL_VALLENATO_JSC_3653.JPG",
  trk_gduwk9g: "74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG",
  trk_gip7kas: "66._NACI_PARA_CANTAR_JSC_3741.JPG",
};

const getImageSource = (trackId: string) => {
  const filename = coverFileMap[trackId];
  if (!filename) return null;

  if (Platform.OS === "android") {
    return { uri: `asset:/covers/${filename}` };
  }

  return coverRequireMap[filename] || null;
};

// Components
import { PlayerHeader } from "../features/audio/components/player/PlayerHeader";
import { PlayerCover } from "../features/audio/components/player/PlayerCover";
import { PlayerInfo } from "../features/audio/components/player/PlayerInfo";
import { PlayerProgressBar } from "../features/audio/components/player/PlayerProgressBar";
import { PlayerControls } from "../features/audio/components/player/PlayerControls";
import { PlayerVolume } from "../features/audio/components/player/PlayerVolume";

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

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const localLib = await loadLocalLibrary();
      const allTracks = localLib?.items || (bundledLibrary.items as Track[]);
      const localTrack = allTracks.find((t: Track) => t.id === trackId);

      if (localTrack) {
        setTrack(localTrack);
      }

      // Configurar la cola completa de reproducción
      const currentTrackIndex = allTracks.findIndex(
        (t: Track) => t.id === trackId
      );
      if (currentTrackIndex !== -1) {
        setQueue(allTracks, currentTrackIndex);
      }

      const current = localTrack || track;
      if (current && (!currentTrack || currentTrack.id !== trackId)) {
        // Solo reproducir si no es la misma canción que está sonando
        await playTrack(current);
      }
    })();
  }, [trackId]);

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
  useEffect(() => {
    if (isPlaying && currentTrack?.id === trackId) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, currentTrack, trackId]);

  if (!track) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Pista no encontrada</Text>
      </View>
    );
  }

  const coverSource = getImageSource(track.id);

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
          isPlaying={isPlaying && currentTrack?.id === trackId}
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
            <PlayerCover
              trackId={track.id}
              pulseAnim={pulseAnim}
              isSpeakerMode={isSpeakerMode}
              onToggleSpeakerMode={() => setIsSpeakerMode(!isSpeakerMode)}
            />
          </View>

          <View style={isLandscape ? styles.rightColumn : undefined}>
            <PlayerInfo track={track} />

            <PlayerProgressBar position={position} duration={duration} />

            {/* Mensaje de error */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <PlayerControls
              isPlaying={isPlaying && currentTrack?.id === trackId}
              isLoaded={isLoaded}
              hasQueue={queue.length > 0}
              playbackMode={playbackMode}
              onPlayPause={togglePlayPause}
              onNext={playNext}
              onPrevious={playPrevious}
              onSeekForward={handleSeekForward}
              onSeekBackward={handleSeekBackward}
              onCycleMode={cyclePlaybackMode}
            />

            <PlayerVolume volume={volume} onVolumeChange={setVolume} />
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
