import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image, useWindowDimensions } from 'react-native';
import bundledLibrary from '../../assets/data/library.json';
import { palette, typography, spacing } from '../theme';
import { Track, Genre } from '../types';
import { loadLocalLibrary } from '../sync';
import { coverByTrackMap } from '../../assets/covers/trackMap';
import { useAudio } from '../contexts/AudioContext';

const genres: Genre[] = ['Merengue', 'Paseo', 'Puya', 'Son'];

// Mapeo de iconos por género musical
const genreIcons: Record<Genre, string> = {
  'Merengue': '🎵',
  'Paseo': '🎶',
  'Puya': '🎼',
  'Son': '♪',
};

// Colores por género
const genreColors: Record<Genre, string> = {
  'Merengue': '#FFE5CC',
  'Paseo': '#FFE0CC',
  'Puya': '#FFEACC',
  'Son': '#FFD5CC',
};

export default function HomeScreen({ navigation }: any) {
  const [items, setItems] = useState<Track[]>(bundledLibrary.items as Track[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'Todos'>('Todos');
  const { width } = useWindowDimensions();
  const { currentTrack, isPlaying, togglePlayPause, playTrack, position, duration } = useAudio();
  
  // Determinar número de columnas según el ancho de la pantalla
  const numColumns = width >= 768 ? 4 : 2;

  const handleTrackPress = async (track: Track) => {
    await playTrack(track);
    navigation.navigate('Player', { trackId: track.id });
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    (async () => {
      const local = await loadLocalLibrary();
      if (local?.items?.length) {
        setItems(local.items as Track[]);
      }
    })();
  }, []);

  // Filtrar items por búsqueda y género
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === 'Todos' || item.genre === selectedGenre;
    
    return matchesSearch && matchesGenre;
  });

  const renderTrackCard = ({ item }: { item: Track }) => {
    const bgColor = genreColors[item.genre] || '#F5F5F5';
    const icon = genreIcons[item.genre] || '♪';
    
    // Obtener la imagen de carátula usando el trackId
    const coverSource = coverByTrackMap[item.id] || null;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleTrackPress(item)}
        activeOpacity={0.7}
      >
        {/* Carátula o icono de género */}
        {coverSource ? (
          <Image 
            source={coverSource} 
            style={styles.coverThumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Text style={styles.iconText}>{icon}</Text>
          </View>
        )}
        
        {/* Información de la canción */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardGenre}>{item.genre === 'Son' ? 'Son' : item.genre}</Text>
          
          {/* Divisor */}
          <View style={styles.cardDivider} />
          
          {/* Duración */}
          {item.duration && (
            <Text style={styles.cardDuration}>{item.duration}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>♪</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Archivo de Audio CCMV</Text>
          <Text style={styles.headerSubtitle}>Centro Cultural de la Música Vallenata</Text>
        </View>
        <Text style={styles.audioCount}>{filteredItems.length} audios disponibles</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, artista o género..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filtros de género */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedGenre === 'Todos' && styles.filterButtonActive]}
          onPress={() => setSelectedGenre('Todos')}
        >
          <Text style={[styles.filterText, selectedGenre === 'Todos' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        {genres.map(genre => (
          <TouchableOpacity 
            key={genre}
            style={[styles.filterButton, selectedGenre === genre && styles.filterButtonActive]}
            onPress={() => setSelectedGenre(genre)}
          >
            <Text style={[styles.filterText, selectedGenre === genre && styles.filterTextActive]}>
              {genre === 'Son' ? 'Son' : genre}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid de tarjetas */}
      <FlatList
        data={filteredItems}
        keyExtractor={t => t.id}
        renderItem={renderTrackCard}
        key={numColumns}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Mini reproductor flotante (PIP) */}
      {currentTrack && (
        <View style={styles.miniPlayer}>
          <TouchableOpacity
            style={styles.miniPlayerContent}
            onPress={() => navigation.navigate('Player', { trackId: currentTrack.id })}
            activeOpacity={0.9}
          >
            {coverByTrackMap[currentTrack.id] ? (
              <Image 
                source={coverByTrackMap[currentTrack.id]} 
                style={styles.miniCover}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.miniCoverPlaceholder}>
                <Text style={styles.miniCoverIcon}>♪</Text>
              </View>
            )}
            
            <View style={styles.miniPlayerInfo}>
              <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={styles.miniPlayerArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>

            <View style={styles.miniTimeContainer}>
              <Text style={styles.miniTimeText}>{formatTime(position)}</Text>
              <Text style={styles.miniTimeSeparator}>/</Text>
              <Text style={styles.miniTimeText}>{formatTime(duration)}</Text>
            </View>

            <TouchableOpacity
              style={styles.miniPlayButton}
              onPress={(e) => {
                e.stopPropagation();
                togglePlayPause();
              }}
            >
              <Text style={styles.miniPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
          
          {/* Barra de progreso */}
          <View style={styles.miniProgressBar}>
            <View style={[styles.miniProgressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      )}

      {/* Botón flotante de sincronización */}
      <TouchableOpacity
        style={styles.syncFab}
        onPress={() => navigation.navigate('Sync')}
        activeOpacity={0.8}
      >
        <Text style={styles.syncFabIcon}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + 10,
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  audioCount: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C2C2C',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  coverThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  cardGenre: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  cardDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4DD0E1',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardCategory: {
    fontSize: 12,
    color: '#666',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: spacing.xl + 80,
    right: spacing.lg,
    width: 380,
    backgroundColor: 'rgba(247, 127, 0, 0.95)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    gap: spacing.sm,
  },
  miniCover: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
  },
  miniCoverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCoverIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  miniPlayerArtist: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  miniTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: spacing.xs,
  },
  miniTimeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  miniTimeSeparator: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  miniPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniPlayIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 1,
  },
  miniProgressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  syncFab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  syncFabIcon: {
    fontSize: 28,
  },
});
