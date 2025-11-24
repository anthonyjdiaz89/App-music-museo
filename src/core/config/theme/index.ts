/**
 * Museo del Vallenato - Design System
 * Color palette and typography based on institutional brand guidelines
 * Modo Dark con rosa institucional como color principal
 */

export const palette = {
  // Fondos oscuros para modo dark
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  
  // Textos claros sobre fondo oscuro
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  
  // Color institucional principal
  primary: '#ff206e',        // Rosa institucional
  primaryDark: '#CC1A58',
  primaryLight: '#FF4D8A',
  
  secondary: '#FFB703',      // Amarillo secundario
  secondaryDark: '#E6A300',
  
  accent: '#ff206e',         // Rosa acento
  accentAlt: '#4DD0E1',      // Turquesa alternativo (altavoz principal)
  
  // Estados
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Bordes y divisores
  border: '#2A2A2A',
  borderLight: '#1F1F1F',
  
  // Overlay para modales
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Colores de categorías con transparencia para modo dark
  categoryHistory: 'rgba(255, 32, 110, 0.15)',
  categoryBio: 'rgba(255, 32, 110, 0.2)',
  categoryInstruments: 'rgba(255, 32, 110, 0.25)',
  categoryTestimonies: 'rgba(255, 32, 110, 0.3)',
};

export const typography = {
  heading: { 
    fontFamily: 'Archivo-Bold', 
    fontSize: 28,
    letterSpacing: -0.5 
  },
  subheading: { 
    fontFamily: 'Archivo-SemiBold', 
    fontSize: 20,
    letterSpacing: -0.3 
  },
  body: { 
    fontFamily: 'Archivo-Regular', 
    fontSize: 16,
    lineHeight: 24 
  },
  bodySmall: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    lineHeight: 20
  },
  caption: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    lineHeight: 16
  },
  button: {
    fontFamily: 'Archivo-SemiBold',
    fontSize: 16,
    letterSpacing: 0.5
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 7.49,
    elevation: 8,
  }
};
