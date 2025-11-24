import React from 'react';
import { View, Image, StyleSheet, Animated, TouchableOpacity, Text, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../../../core/config/theme';

// Mapa de require() para web/iOS
const coverRequireMap: Record<string, any> = {
  '3._DE_FRENTE_JSC_3542.JPG': require('../../../../../assets/covers/3._DE_FRENTE_JSC_3542.JPG'),
  '4._DOS_GRANDES_JSC_3544.JPG': require('../../../../../assets/covers/4._DOS_GRANDES_JSC_3544.JPG'),
  '11._GANO_EL_FOLCLOR_JSC_3565.JPG': require('../../../../../assets/covers/11._GANO_EL_FOLCLOR_JSC_3565.JPG'),
  '14._MI_VIDA_MUSICAL_JSC_3572.JPG': require('../../../../../assets/covers/14._MI_VIDA_MUSICAL_JSC_3572.JPG'),
  '17._UN_CANTO_CELESTIAL_JSC_3582.JPG': require('../../../../../assets/covers/17._UN_CANTO_CELESTIAL_JSC_3582.JPG'),
  '20_ADELANTE_JSC_3596.JPG': require('../../../../../assets/covers/20_ADELANTE_JSC_3596.JPG'),
  '22._POR_LO_ALTO_JSC_3600.JPG': require('../../../../../assets/covers/22._POR_LO_ALTO_JSC_3600.JPG'),
  '39.FESTIVAL_VALLENATO_JSC_3653.JPG': require('../../../../../assets/covers/39.FESTIVAL_VALLENATO_JSC_3653.JPG'),
  '66._NACI_PARA_CANTAR_JSC_3741.JPG': require('../../../../../assets/covers/66._NACI_PARA_CANTAR_JSC_3741.JPG'),
  '74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG': require('../../../../../assets/covers/74._CUARTO_CONCIERTO_VALLENATO_JSC_3765.JPG'),
  '77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG': require('../../../../../assets/covers/77_FIESTA_VALLENATA_VOLUMEN_5_JSC_3824.JPG'),
};

// Mapeo de track IDs a nombres de archivo
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

const getImageSource = (trackId: string) => {
  const filename = coverFileMap[trackId];
  if (!filename) return null;
  
  if (Platform.OS === 'android') {
    return { uri: `asset:/covers/${filename}` };
  }
  
  return coverRequireMap[filename] || null;
};

interface PlayerCoverProps {
  trackId: string;
  pulseAnim: Animated.Value;
  isSpeakerMode: boolean;
  onToggleSpeakerMode: () => void;
}

export const PlayerCover: React.FC<PlayerCoverProps> = ({ 
  trackId, 
  pulseAnim, 
  isSpeakerMode, 
  onToggleSpeakerMode 
}) => {
  const coverSource = getImageSource(trackId);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  // Ajustar tamaño de cover según orientación
  const coverSize = isLandscape ? Math.min(height * 0.5, 280) : 340;

  return (
    <View style={styles.visualContainer}>
      <Animated.View style={[
        styles.coverContainer, 
        { 
          width: coverSize,
          height: coverSize,
          transform: [{ scale: pulseAnim }] 
        }
      ]}>
        {coverSource ? (
          <Image 
            source={coverSource} 
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-note" size={120} color="#ff206e" />
          </View>
        )}
      </Animated.View>

      <TouchableOpacity 
        style={styles.speakerButton}
        onPress={onToggleSpeakerMode}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isSpeakerMode ? "volume-high" : "volume-medium"} 
          size={20} 
          color="#FFFFFF" 
        />
        <Text style={styles.speakerText}>
          {isSpeakerMode ? 'Principal' : 'Altavoz'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  visualContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  coverContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 32, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerButton: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#4DD0E1',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  speakerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
