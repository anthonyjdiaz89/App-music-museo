/**
 * HomeScreen - Pantalla principal con categorías tipo kiosk
 * Muestra tarjetas organizadas por Historia, Biografías, Instrumentos, Testimonios
 */

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import bundledLibrary from '../../assets/data/library.json';
import { palette, typography, spacing } from '../theme';
import { Track, Category } from '../types';
import { loadLocalLibrary } from '../sync';

const categories: Category[] = ['Historia', 'Biografías', 'Instrumentos', 'Testimonios'];

// Mapeo de iconos por categoría
const categoryIcons: Record<Category, string> = {
  'Historia': '🕒',
  'Biografías': '✍️',
  'Instrumentos': '♪',
  'Testimonios': '🎙️',
};

// Colores por categoría
const categoryColors: Record<Category, string> = {
  'Historia': '#FFE5CC',
  'Biografías': '#FFE0CC',
  'Instrumentos': '#FFEACC',
  'Testimonios': '#FFD5CC',
};

export default function HomeScreen({ navigation }: any) {
  const [items, setItems] = useState<Track[]>(bundledLibrary.items as Track[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Todos'>('Todos');

  useEffect(() => {
    (async () => {
      const local = await loadLocalLibrary();
      if (local?.items?.length) {
        setItems(local.items as Track[]);
      }
    })();
  }, []);

  // Filtrar items por búsqueda y categoría
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderTrackCard = ({ item }: { item: Track }) => {
    const bgColor = item.category ? categoryColors[item.category] : '#F5F5F5';
    const icon = item.category ? categoryIcons[item.category] : '♪';

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() => navigation.navigate('Player', { trackId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardCategory}>{item.category || item.genre}</Text>
        </View>

        {item.duration && (
          <Text style={styles.cardDuration}>{item.duration}</Text>
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
          placeholder="Buscar por título, artista o categoría..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filtros de categoría */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, selectedCategory === 'Todos' && styles.filterButtonActive]}
          onPress={() => setSelectedCategory('Todos')}
        >
          <Text style={[styles.filterText, selectedCategory === 'Todos' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>

        {categories.map(cat => (
          <TouchableOpacity 
            key={cat}
            style={[styles.filterButton, selectedCategory === cat && styles.filterButtonActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
              {cat}
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
    borderRadius: 16,
    padding: spacing.md,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: spacing.xs,
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
