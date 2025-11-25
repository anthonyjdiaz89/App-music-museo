import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Track } from '../../core/domain/types';
import { palette, spacing } from '../../core/config/theme';
import { GENRE_COLORS, GENRE_ICONS } from '../../core/config/constants/genres';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { getCoverSource } from '../../../assets/covers/coverMap';

interface TrackCardProps {
  item: Track;
  viewMode: 'grid' | 'list';
  onPress: (track: Track) => void;
  index?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);


export const TrackCard: React.FC<TrackCardProps> = ({ item, viewMode, onPress, index = 0 }) => {
  const bgColor = GENRE_COLORS[item.genre] || '#F5F5F5';
  const icon = GENRE_ICONS[item.genre] || '♪';
  const imageSource = getCoverSource(item.id);
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
