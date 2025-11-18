/**
 * WelcomeScreen - Pantalla de bienvenida tipo kiosk
 * Muestra el logo CCMV y botón para explorar el archivo de audio
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { palette, typography, spacing } from '../theme';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      {/* Logo CCMV */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>CCMV</Text>
        <Text style={styles.logoSubtext}>MUSEO DEL VALLENATO</Text>
      </View>

      {/* Título principal */}
      <Text style={styles.title}>Archivo de Audio</Text>
      <Text style={styles.subtitle}>
        Explora la colección completa de audios del museo
      </Text>

      {/* Botón principal */}
      <TouchableOpacity 
        style={styles.mainButton}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonIcon}>♪</Text>
        <Text style={styles.buttonText}>Explorar Audios</Text>
      </TouchableOpacity>

      {/* Pie de página */}
      <Text style={styles.footer}>
        Centro Cultural y de Convenciones de la Música Vallenata
      </Text>

      {/* Hint táctil */}
      <Text style={styles.hint}>Toque la pantalla para comenzar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 2,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '700',
    color: '#5A5A5A',
    letterSpacing: 8,
    marginBottom: spacing.xs,
  },
  logoSubtext: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5A5A5A',
    letterSpacing: 4,
  },
  title: {
    fontSize: 42,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: spacing.xxl * 2,
    textAlign: 'center',
    maxWidth: 500,
  },
  mainButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.lg + 8,
    paddingHorizontal: spacing.xxl * 2,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonIcon: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl + 20,
    fontSize: 12,
    color: '#AAA',
    textAlign: 'center',
  },
  hint: {
    position: 'absolute',
    bottom: spacing.lg,
    fontSize: 14,
    color: '#CCC',
    fontStyle: 'italic',
  },
});
