import { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Text,
  Platform,
} from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { palette, spacing } from "../../core/config/theme";
import { Track, Genre } from "../../core/domain/types";
import { useAudio } from "../../features/audio/AudioContext";
import { GENRES } from "../../core/config/constants/genres";
import { TrackCard } from "../../shared/components/TrackCard";
import { MiniPlayer } from "../../shared/components/MiniPlayer";
import { AppHeader } from "../../shared/components/AppHeader";
import { useFilteredTracks } from "./hooks/useFilteredTracks";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useLibrary } from "../../features/library/hooks/useLibrary";
import { usePulseAnimation } from "@src/shared/animations/usePulseAnimation";
import { GENRE_ICON_MAP } from "@src/features/audio/genreIconMap";
import { fadeSpring } from "@src/shared/animations/animations";

export default function HomeScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<Genre | "Todos">("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { width } = useWindowDimensions();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playTrack,
    position,
    duration,
  } = useAudio();

  const numColumns = viewMode === "list" ? 1 : width >= 768 ? 4 : 2;

  const handleTrackPress = async (track: Track) => {
    await playTrack(track);
    navigation.navigate("Player", { trackId: track.id });
  };

  const fabAnimatedStyle = usePulseAnimation();
  const { items } = useLibrary(); // se puede extraer {loading} para hacer una pantalla de carga
  const debouncedQuery = useDebouncedValue(searchQuery);
  const filteredItems = useFilteredTracks(items, debouncedQuery, selectedGenre);

  // if (loading) {
  //   return <LoadingScreen message="Cargando biblioteca..."></LoadingScreen> // <-- Pntalla de carga
  // }

  return (
    <View style={styles.container}>
      <Animated.View entering={fadeSpring(40, 14)}>
        <AppHeader trackCount={filteredItems.length} />
      </Animated.View>

      <Animated.View
        style={styles.searchContainer}
        entering={fadeSpring(80, 16)}
      >
        <Ionicons
          name="search"
          size={20}
          color={palette.primary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar canción, artista, género o palabra clave..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </Animated.View>

      <Animated.View style={styles.filterRow} entering={fadeSpring(120, 16)}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedGenre === "Todos" && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedGenre("Todos")}
          >
            <Ionicons
              name="apps"
              size={16}
              color={selectedGenre === "Todos" ? "#FFFFFF" : palette.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.filterText,
                selectedGenre === "Todos" && styles.filterTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          {GENRES.map((genre) => {
            const iconName = GENRE_ICON_MAP[genre];

            return (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.filterButton,
                  selectedGenre === genre && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedGenre(genre)}
              >
                <Ionicons
                  name={iconName as any}
                  size={16}
                  color={selectedGenre === genre ? "#FFFFFF" : palette.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.filterText,
                    selectedGenre === genre && styles.filterTextActive,
                  ]}
                >
                  {genre === "Son" ? "Son" : genre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === "list" && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Ionicons
              name="list"
              size={20}
              color={viewMode === "list" ? "#FFFFFF" : palette.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === "grid" && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === "grid" ? "#FFFFFF" : palette.primary}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <FlatList
        data={filteredItems}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <TrackCard
            item={item}
            viewMode={viewMode}
            onPress={handleTrackPress}
            index={index}
          />
        )}
        key={`${viewMode}-${numColumns}`}
        numColumns={viewMode === "list" ? 1 : numColumns}
        columnWrapperStyle={viewMode === "grid" ? styles.row : null}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
      />

      {currentTrack && (
        <MiniPlayer
          track={currentTrack}
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          onPlayPause={togglePlayPause}
          onPress={() =>
            navigation.navigate("Player", { trackId: currentTrack.id })
          }
        />
      )}

      <AnimatedTouchableOpacity
        style={[styles.syncFab, fabAnimatedStyle]}
        onPress={() => navigation.navigate("Welcome")}
        activeOpacity={0.8}
      >
        <Ionicons name="home" size={28} color="#FFFFFF" />
      </AnimatedTouchableOpacity>
    </View>
  );
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

// @ts-ignore-next-line
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: palette.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0px 2px 4px rgba(0,0,0,0.08)",
      },
    }),
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: palette.textPrimary,
    // @ts-ignore-next-line
    outlineStyle: "none", // esto es para web, quita el outline al hacer focus
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    flex: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  filterButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.primary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: palette.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: palette.primary,
    overflow: "hidden",
    marginLeft: spacing.sm,
  },
  viewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  viewButtonActive: {
    backgroundColor: palette.primary,
  },
  flatListContent: {
    padding: spacing.md,
    paddingBottom: 100, // Space for MiniPlayer
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  syncFab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
      },
    }),
  },
});
