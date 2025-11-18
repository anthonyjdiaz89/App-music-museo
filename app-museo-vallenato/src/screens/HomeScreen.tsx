import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { coversMap } from '../../assets/covers/map';
import bundledLibrary from '../../assets/data/library.json';
import { palette, typography } from '../theme';
import { Track } from '../types';
import { loadLocalLibrary } from '../sync';

// Usamos 'Sone' (como viene del JSON) pero mostramos 'Son' en UI
const genresOrder = ['Merengue','Paseo','Puya','Sone'];

export default function HomeScreen({ navigation }: any) {
  const [items, setItems] = useState<Track[]>(bundledLibrary.items as Track[]);
  useEffect(() => {
    (async () => {
      const local = await loadLocalLibrary();
      if (local?.items?.length) {
        setItems(local.items as Track[]);
      }
    })();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: palette.background, paddingTop: 50 }}>
      <Text style={{ ...typography.heading, color: palette.textPrimary, paddingHorizontal:16 }}>Museo del Vallenato</Text>
      <FlatList
        data={genresOrder}
        keyExtractor={g => g}
        renderItem={({ item: genre }) => {
          const tracks = items.filter(t => t.genre === genre);
          return (
            <View style={{ marginTop: 24 }}>
              <Text style={{ ...typography.subheading, color: palette.accent, paddingHorizontal:16 }}>{genre === 'Sone' ? 'Son' : genre}</Text>
              <FlatList
                data={tracks}
                horizontal
                showsHorizontalScrollIndicator={false}
                initialNumToRender={12}
                windowSize={7}
                keyExtractor={t => t.id}
                renderItem={({ item }) => {
                  const coverLocal = item.imageUrl && item.imageUrl.split('/').pop();
                  let src: any = undefined;
                  // Carátula descargada si existe
                  if (item.localImagePath) {
                    src = { uri: item.localImagePath } as any;
                  }
                  if (coverLocal && coversMap[coverLocal]) {
                    // Las imágenes están en public/assets/covers/ para web
                    src = src || { uri: `/assets/covers/${coverLocal}` };
                  }
                  if (!src && coverLocal) {
                    // Coincidencia difusa: intenta emparejar por texto simplificado
                    const simple = coverLocal
                      .toLowerCase()
                      .replace(/\.(jpg|jpeg|png)$/,'')
                      .replace(/[^a-z0-9 ]+/g,' ')
                      .replace(/\s{2,}/g,' ')
                      .trim();
                    const keys = Object.keys(coversMap);
                    const match = keys.find(k => {
                      const ks = k.toLowerCase().replace(/\.(jpg|jpeg|png)$/,'').replace(/[^a-z0-9 ]+/g,' ').replace(/\s{2,}/g,' ').trim();
                      return ks.includes(simple) || simple.includes(ks);
                    });
                    if (match) {
                      src = src || { uri: `/assets/covers/${match}` };
                    }
                  }
                  if (!src) {
                    // Fallback determinista basado en hash del id
                    const keys = Object.keys(coversMap);
                    if (keys.length) {
                      let hash = 0; for (let i=0;i<item.id.length;i++){ hash = (hash*31 + item.id.charCodeAt(i)) >>> 0; }
                      const fallbackKey = keys[hash % keys.length];
                      src = src || { uri: `/assets/covers/${fallbackKey}` };
                    }
                  }
                  return (
                    <TouchableOpacity onPress={() => navigation.navigate('Player', { trackId: item.id })} style={{ width:140, marginHorizontal:8 }}>
                      {src ? (
                        <Image source={src} style={{ width:140, height:140, borderRadius:8 }} />
                      ) : (
                        <View style={{ height:140, backgroundColor: palette.surface, borderRadius:8, justifyContent:'center', alignItems:'center' }}>
                          <Text numberOfLines={3} style={{ color: palette.textSecondary, fontSize:12, textAlign:'center', padding:4 }}>{item.title}</Text>
                        </View>
                      )}
                      <Text numberOfLines={1} style={{ color: palette.textPrimary, fontSize:12, marginTop:4 }}>{item.artist}</Text>
                    </TouchableOpacity>
                  )
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
}
