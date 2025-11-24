import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import library from '../../assets/data/library.json';
import { Track } from '../core/domain/types';
import { palette, spacing } from '../core/config/theme';
import { TrackCard } from '../shared/components/TrackCard';
import { SearchBar } from '../features/search/components/SearchBar';
import { MiniPlayer } from '../shared/components/MiniPlayer';
import { useAudio } from '../features/audio/AudioContext';

export default function SearchScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const items: Track[] = (library.items as Track[]);
  const { currentTrack, isPlaying, togglePlayPause, position, duration } = useAudio();
  
  const results = useMemo(() => {
    if (!q.trim()) return [];

    // Normalizar texto: quitar acentos y convertir a minúsculas
    const normalizeText = (text: string) => 
      text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const searchWords = normalizeText(q).split(/\s+/).filter(w => w.length > 0);
    
    return items.filter(track => {
      // Crear un string con todos los campos buscables
      const searchableContent = [
        track.title,
        track.artist,
        track.genre,
        track.description || '',
        // Separar nombre y apellido del artista
        ...track.artist.split(' ')
      ].join(' ');

      const normalizedContent = normalizeText(searchableContent);

      // Verificar que todas las palabras de búsqueda estén en el contenido
      return searchWords.every(word => normalizedContent.includes(word));
    });
  }, [q, items]);

  const handleTrackPress = (track: Track) => {
    navigation.navigate('Player', { trackId: track.id });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerSpacer} />
      
      <SearchBar 
        value={q} 
        onChangeText={setQ} 
        onClear={() => setQ('')}
      />

      <FlatList
        data={results}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TrackCard 
            item={item} 
            viewMode="list" 
            onPress={handleTrackPress} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          q.trim().length > 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron resultados</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.placeholderText}>Escribe para buscar...</Text>
            </View>
          )
        }
      />

      {currentTrack && (
        <MiniPlayer 
          track={currentTrack}
          isPlaying={isPlaying}
          position={position}
          duration={duration}
          onPlayPause={togglePlayPause}
          onPress={() => navigation.navigate('Player', { trackId: currentTrack.id })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  headerSpacer: {
    height: 40, // Status bar spacer
  },
  listContent: {
    paddingBottom: 100, // Space for MiniPlayer
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 16,
  },
  placeholderText: {
    color: palette.textTertiary,
    fontSize: 16,
  },
});
