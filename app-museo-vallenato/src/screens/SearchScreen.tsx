import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity } from 'react-native';
import library from '../../assets/data/library.json';
import { Track } from '../types';
import { palette, typography } from '../theme';

export default function SearchScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const items: Track[] = (library.items as Track[]);
  
  const results = useMemo(() => {
    if (!q.trim()) return items;

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
  
  return (
    <View style={{ flex:1, backgroundColor: palette.background, paddingTop: 60 }}>
      <TextInput
        placeholder="Buscar canción, artista, género o palabra clave..."
        placeholderTextColor={palette.textSecondary}
        value={q}
        onChangeText={setQ}
        style={{ margin:16, padding:12, backgroundColor: palette.surface, borderRadius:8, color: palette.textPrimary }}
      />
      <FlatList
        data={results}
        keyExtractor={t => t.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Player', { trackId: item.id })} style={{ paddingHorizontal:16, paddingVertical:10, borderBottomWidth:1, borderBottomColor:'#222' }}>
            <Text style={{ color: palette.textPrimary }}>{item.title}</Text>
            <Text style={{ color: palette.textSecondary, fontSize:12 }}>{item.artist} • {item.genre}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
