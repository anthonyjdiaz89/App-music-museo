import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../../core/domain/types';
import { palette, spacing } from '../../core/config/theme';
import { GENRE_COLORS, GENRE_ICONS } from '../../core/config/constants/genres';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface TrackCardProps {
  item: Track;
  viewMode: 'grid' | 'list';
  onPress: (track: Track) => void;
  index?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Mapeo de track IDs a nombres de archivo de carátula
const coverFileMap: Record<string, string> = {
  'trk_0djxswp': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_3q49o4t': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_zv6nwrm': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_epxzpbi': '22._POR_LO_ALTO_JSC_3600.JPG',
  'trk_xnqbvmp': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_7gspukd': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_phebo90': '14._MI_VIDA_MUSICAL_JSC_3572.JPG',
  'trk_093fsoh': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_fbzkhi1': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_y4rw3p2': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_aqk4er2': '11._GANO_EL_FOLCLOR_JSC_3565.JPG',
  'trk_aymzuem': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_5vrpb3o': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_eoc2vb8': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_qt11oxl': '22._POR_LO_ALTO_JSC_3600.JPG',
  'trk_4dlxprq': '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG',
  'trk_vokmo7t': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_zmxwq4h': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_loeydq0': '11._GANO_EL_FOLCLOR_JSC_3565.JPG',
  'trk_ntalu2v': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_x97c44q': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_afovlx1': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_sgltzb7': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_7rduj03': '77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG',
  'trk_fxez35t': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_i4y06kv': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_gn1tr7b': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_3iozs2o': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_22imsu2': '22._POR_LO_ALTO_JSC_3600.JPG',
  'trk_3ljtrwl': '77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG',
  'trk_cw3njdp': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_z2kfzfu': '4._DOS_GRANDES_JSC_3544.JPG',
  'trk_fgw4y5b': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_838gqzm': '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG',
  'trk_u9vwbj3': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_2d66dvr': '20_ADELANTE_JSC_3596.JPG',
  'trk_l9mpsff': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_pyuh3rd': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_xeznr2i': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_3j9ilp7': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_sp0uchh': '17._UN_CANTO_CELESTIAL_JSC_3582.JPG',
  'trk_jsmh1n3': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_dtso3kj': '20_ADELANTE_JSC_3596.JPG',
  'trk_mffy227': '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG',
  'trk_yk29ggp': '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG',
  'trk_xb5cnjy': '3._DE_FRENTE_JSC_3542.JPG',
  'trk_f0a62em': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_r8t2li2': '39.FESTIVAL_VALLENATO_JSC_3653.JPG',
  'trk_gduwk9g': '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG',
  'trk_gip7kas': '66._NACI_PARA_CANTAR_JSC_3741.JPG',
};

// Mapa de require() para web/iOS
const coverRequireMap: Record<string, any> = {
  '3._DE_FRENTE_JSC_3542.JPG': require('../../../assets/covers/3._DE_FRENTE_JSC_3542.JPG'),
  '4._DOS_GRANDES_JSC_3544.JPG': require('../../../assets/covers/4._DOS_GRANDES_JSC_3544.JPG'),
  '11._GANO_EL_FOLCLOR_JSC_3565.JPG': require('../../../assets/covers/11._GANO_EL_FOLCLOR_JSC_3565.JPG'),
  '14._MI_VIDA_MUSICAL_JSC_3572.JPG': require('../../../assets/covers/14._MI_VIDA_MUSICAL_JSC_3572.JPG'),
  '17._UN_CANTO_CELESTIAL_JSC_3582.JPG': require('../../../assets/covers/17._UN_CANTO_CELESTIAL_JSC_3582.JPG'),
  '20_ADELANTE_JSC_3596.JPG': require('../../../assets/covers/20_ADELANTE_JSC_3596.JPG'),
  '22._POR_LO_ALTO_JSC_3600.JPG': require('../../../assets/covers/22._POR_LO_ALTO_JSC_3600.JPG'),
  '39.FESTIVAL_VALLENATO_JSC_3653.JPG': require('../../../assets/covers/39.FESTIVAL_VALLENATO_JSC_3653.JPG'),
  '66._NACI_PARA_CANTAR_JSC_3741.JPG': require('../../../assets/covers/66._NACI_PARA_CANTAR_JSC_3741.JPG'),
  '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG': require('../../../assets/covers/74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG'),
  '77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG': require('../../../assets/covers/77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG'),
};

// Helper para obtener URI de imagen desde assets de Android
const getImageSource = (trackId: string) => {
  const filename = coverFileMap[trackId];
  if (!filename) return null;
  
  if (Platform.OS === 'android') {
    // En Android, usar asset:/ URI para acceder a assets
    return { uri: `asset:/covers/${filename}` };
  }
  
  // En iOS/web, usar require
  return coverRequireMap[filename] || null;
};

export const TrackCard: React.FC<TrackCardProps> = ({ item, viewMode, onPress, index = 0 }) => {
  const bgColor = GENRE_COLORS[item.genre] || '#F5F5F5';
  const icon = GENRE_ICONS[item.genre] || '♪';
  const imageSource = getImageSource(item.id);
  const [imageError, setImageError] = React.useState(false);
  
  const entering = (viewMode === 'list' ? FadeInDown : FadeInUp)
    .delay(Math.min(index, 12) * 40)
    .springify()
    .damping(16);

  if (viewMode === 'list') {
    return (
      <AnimatedTouchableOpacity 
        entering={entering}
        style={styles.listItem}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        {imageSource && !imageError ? (
          <Image 
            source={imageSource} 
            style={styles.listThumbnail}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.listIconContainer, { backgroundColor: bgColor }]}>
            <Text style={styles.listIconText}>{icon}</Text>
          </View>
        )}
        
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.listMeta}>
            <Text style={styles.listArtist} numberOfLines={1}>{item.artist}</Text>
            <Text style={styles.listDot}>•</Text>
            <Text style={styles.listGenre}>{item.genre === 'Son' ? 'Son' : item.genre}</Text>
          </View>
        </View>

        {item.duration && (
          <Text style={styles.listDuration}>{item.duration}</Text>
        )}

        <View style={styles.listPlayIcon}>
          <Ionicons name="play-circle-outline" size={28} color={palette.primary} />
        </View>
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedTouchableOpacity 
      entering={entering}
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      {imageSource && !imageError ? (
        <Image 
          source={imageSource} 
          style={styles.coverThumbnail}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardGenre}>{item.genre === 'Son' ? 'Son' : item.genre}</Text>
        <View style={styles.cardDivider} />
        {item.duration && (
          <Text style={styles.cardDuration}>{item.duration}</Text>
        )}
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // List Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  listThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  listIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listIconText: {
    fontSize: 24,
  },
  listContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listArtist: {
    fontSize: 13,
    color: palette.textSecondary,
    flex: 1,
  },
  listDot: {
    fontSize: 13,
    color: palette.textTertiary,
  },
  listGenre: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  listDuration: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.accentAlt,
    marginRight: spacing.sm,
  },
  listPlayIcon: {
    opacity: 0.6,
  },

  // Grid Styles
  card: {
    flex: 1,
    margin: spacing.sm,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    backgroundColor: palette.surfaceElevated,
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
    color: palette.textPrimary,
    marginBottom: 4,
  },
  cardGenre: {
    fontSize: 12,
    color: palette.textSecondary,
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: palette.border,
    marginBottom: 8,
  },
  cardDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.accentAlt,
  },
});
