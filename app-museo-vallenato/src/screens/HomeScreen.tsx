import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import bundledLibrary from '../../assets/data/library.json';
import { palette, typography, spacing } from '../theme';
import { Track, Genre } from '../types';
import { loadLocalLibrary } from '../sync';
import { coverByTrackMap } from '../../assets/covers/trackMap';

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
        onPress={() => navigation.navigate('Player', { trackId: item.id })}
        activeOpacity={0.7}
      >
        {/* Icono de género en la esquina superior izquierda */}
        <View style={[styles.cardIconBadge, { backgroundColor: bgColor }]}>
          <Text style={styles.iconBadgeText}>{icon}</Text>
        </View>

        {/* Imagen de carátula o placeholder */}
        {coverSource ? (
          <Image 
            source={coverSource} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: bgColor }]}>
            <Text style={styles.placeholderIcon}>♪</Text>
          </View>
        )}

        {/* Divisor */}
        <View style={styles.cardDivider} />
        
        {/* Información de la canción */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardGenre} numberOfLines={1}>{item.genre === 'Son' ? 'Son' : item.genre}</Text>
        </View>

        {/* Duración en la esquina inferior derecha */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
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
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

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
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardIconBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconBadgeText: {
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F5F5',
  },
  coverPlaceholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 48,
    opacity: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  cardInfo: {
    padding: spacing.md,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  cardGenre: {
    fontSize: 12,
    color: '#999999',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
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
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 12,
    color: '#666',
  },
  cardDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4DD0E1',
    marginTop: spacing.xs,
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
