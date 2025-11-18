/**
 * Museo del Vallenato - Design System
 * Color palette and typography based on institutional brand guidelines
 * Adaptado para UI tipo kiosk con fondos claros
 */

export const palette = {
  // Fondos claros para modo kiosk
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F5F5',
  
  // Textos oscuros sobre fondo claro
  textPrimary: '#2C2C2C',
  textSecondary: '#666666',
  textTertiary: '#888888',
  
  // Colores institucionales CCMV
  primary: '#F77F00',        // Naranja principal
  primaryDark: '#D66B00',
  primaryLight: '#FF9933',
  
  secondary: '#FFB703',      // Amarillo secundario
  secondaryDark: '#E6A300',
  
  accent: '#FB8500',         // Naranja acento
  accentAlt: '#4DD0E1',      // Turquesa alternativo (aliavoz principal)
  
  // Estados
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Bordes y divisores
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Overlay para modales
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Colores de categorías
  categoryHistory: '#FFE5CC',
  categoryBio: '#FFE0CC',
  categoryInstruments: '#FFEACC',
  categoryTestimonies: '#FFD5CC',
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
