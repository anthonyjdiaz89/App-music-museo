import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, Modal, TextInput } from 'react-native';
import { spacing } from '../core/config/theme';

interface WelcomeScreenProps { navigation: any; }

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const settingsTapCount = useRef(0);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinValue, setPinValue] = useState('');

  const goHome = () => navigation.navigate('Home');

  const handleSettingsPress = () => {
    console.log('[Welcome] settings pressed');
    settingsTapCount.current += 1;

    if (settingsTapCount.current >= 3) {
      settingsTapCount.current = 0;
      setPinValue('');
      setPinModalVisible(true);
    }
  };

  const handleConfirmPin = () => {
    const expectedPin = '99151';
    if (pinValue === expectedPin) {
      setPinModalVisible(false);
      navigation.navigate('Admin');
    } else {
      Alert.alert('PIN incorrecto', 'El PIN ingresado no es válido');
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.pattern}>
        <Image
          source={require('../../assets/figuras.png')}
          style={styles.patternImage}
          resizeMode="stretch"
        />
      </View>
      {/* Botón de settings oculto (arriba a la derecha, triple toque) */}
      <TouchableOpacity
        style={styles.settingsButton}
        activeOpacity={0.7}
        onPress={handleSettingsPress}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <Image 
          source={require('../../assets/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>Archivo de Audio</Text>
        <Text style={styles.subtitle}>Explora la colección completa de audios del museo</Text>
        <TouchableOpacity style={styles.mainButton} onPress={goHome} activeOpacity={0.9}>
          <Text style={styles.buttonIcon}>♪</Text>
          <Text style={styles.buttonText}>Explorar Audios</Text>
        </TouchableOpacity>
        <Text style={styles.hint}>Toca la pantalla para comenzar</Text>
        <Text style={styles.footer}>Centro Cultural y de Conexiones de la Música Vallenata</Text>
      </View>

      {/* Modal para PIN de admin (web y nativo) */}
      <Modal
        visible={pinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>PIN de administrador</Text>
            <TextInput
              style={styles.modalInput}
              value={pinValue}
              onChangeText={setPinValue}
              keyboardType="number-pad"
              secureTextEntry
              placeholder="Ingrese PIN"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmPin}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const PINK = '#f50678';
const WHITE = '#ffffff';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PINK,
    flexDirection: 'row',
  },
  pattern: {
    width: 150,
    alignSelf: 'stretch',
    height: '100%',
  },
  patternImage: {
    width: 150,
    height: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    zIndex: 10,
  },
  settingsIcon: {
    fontSize: 26,
    color: WHITE,
    opacity: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: WHITE,
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: WHITE,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    maxWidth: 420,
  },
  mainButton: {
    backgroundColor: WHITE,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: spacing.lg,
  },
  buttonIcon: { fontSize: 18, color: '#ff2d88' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#222' },
  hint: {
    marginTop: spacing.md,
    fontSize: 11,
    color: WHITE,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  footer: {
    marginTop: spacing.xl,
    fontSize: 10,
    color: WHITE,
    opacity: 0.6,
    textAlign: 'center',
    maxWidth: 360,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 12,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: WHITE,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 3,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  modalButtonConfirm: {
    backgroundColor: WHITE,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
