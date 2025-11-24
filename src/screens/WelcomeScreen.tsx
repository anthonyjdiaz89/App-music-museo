import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { spacing } from '../core/config/theme';

interface WelcomeScreenProps { navigation: any; }

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const goHome = () => navigation.navigate('Home');

  return (
    <View style={styles.root}>
      <View style={styles.pattern}>
        <Image
          source={require('../../assets/figuras.png')}
          style={styles.patternImage}
          resizeMode="stretch"
        />
      </View>
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
        <TouchableOpacity onPress={() => navigation.navigate('Admin')}>
          <Text style={[styles.footer, { marginTop: spacing.xs, opacity: 0.4 }]}>Admin</Text>
        </TouchableOpacity>
      </View>
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
});
