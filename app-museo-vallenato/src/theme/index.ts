/**
 * Museo del Vallenato - Design System
 * Color palette and typography based on institutional brand guidelines
 */

export const palette = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceElevated: '#252525',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textTertiary: '#787878',
  
  primary: '#F77F00',
  primaryDark: '#D66B00',
  primaryLight: '#FF9933',
  
  secondary: '#FFB703',
  secondaryDark: '#E6A300',
  
  accent: '#FB8500',
  accentAlt: '#FFAA33',
  
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  border: '#2A2A2A',
  borderLight: '#363636',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
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
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  }
};
