import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, FlatList, TouchableOpacity } from 'react-native';
import library from '../../assets/data/library.json';
import { Track } from '../types';
import { palette, typography } from '../theme';

export default function SearchScreen({ navigation }: any) {
  const [q, setQ] = useState('');
  const items: Track[] = (library.items as Track[]);
  const results = useMemo(() => {
    const query = q.toLowerCase();
    return items.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query) || t.genre.toLowerCase().includes(query));
  }, [q]);
  return (
    <View style={{ flex:1, backgroundColor: palette.background, paddingTop: 60 }}>
      <TextInput
        placeholder="Buscar artista, canción o género"
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
