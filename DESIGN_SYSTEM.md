# Museo del Vallenato - Sistema de Diseño

## Identidad Visual

Este proyecto respeta la identidad visual institucional del Museo del Vallenato según las guías de marca 2025.

## Paleta de Colores

### Colores Principales
- **Primary Orange**: `#F77F00` - Color principal de la marca
- **Secondary Yellow**: `#FFB703` - Color secundario complementario
- **Accent**: `#FB8500` - Color de acento para elementos interactivos

### Colores de Fondo
- **Background**: `#0A0A0A` - Fondo principal oscuro
- **Surface**: `#1A1A1A` - Superficies elevadas
- **Surface Elevated**: `#252525` - Superficies con mayor elevación

### Colores de Texto
- **Text Primary**: `#FFFFFF` - Texto principal de alta legibilidad
- **Text Secondary**: `#B8B8B8` - Texto secundario
- **Text Tertiary**: `#787878` - Texto terciario para información auxiliar

### Colores de Estado
- **Success**: `#4CAF50` - Operaciones exitosas
- **Error**: `#F44336` - Errores y alertas críticas
- **Warning**: `#FF9800` - Advertencias
- **Info**: `#2196F3` - Información contextual

## Tipografía

### Fuentes
Las fuentes están ubicadas en `Fuentes/` y siguen la jerarquía:

1. **Archivo** (Principal) - Uso general en la aplicación móvil
   - Bold: Títulos y encabezados
   - SemiBold: Subtítulos y elementos destacados
   - Regular: Cuerpo de texto

2. **Roboto/Roboto Slab** - Alternativas para admin panel
3. **Aristotelica** - Uso institucional especial
4. **Barlow** - Elementos secundarios
5. **Product Sans** - Elementos de interfaz

### Escalas Tipográficas

```typescript
heading: 28px / Bold / -0.5 letter-spacing
subheading: 20px / SemiBold / -0.3 letter-spacing
body: 16px / Regular / 24px line-height
bodySmall: 14px / Regular / 20px line-height
caption: 12px / Regular / 16px line-height
button: 16px / SemiBold / 0.5 letter-spacing
```

## Espaciado

Sistema de espaciado consistente basado en múltiplos de 4:

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

## Bordes y Radios

- **sm**: 4px - Inputs, botones pequeños
- **md**: 8px - Tarjetas, botones estándar
- **lg**: 12px - Contenedores principales
- **xl**: 16px - Modales, elementos destacados
- **round**: 999px - Botones circulares, badges

## Sombras

Tres niveles de elevación para crear jerarquía visual:

- **sm**: Elevation 2 - Botones, chips
- **md**: Elevation 4 - Tarjetas, menús
- **lg**: Elevation 8 - Modales, diálogos

## Componentes

### Botones
- **Primary**: Fondo naranja `#F77F00`, acciones principales
- **Secondary**: Fondo gris `#252525`, acciones secundarias
- **Success**: Fondo verde `#4CAF50`, confirmaciones
- **Danger**: Fondo rojo `#F44336`, acciones destructivas
- **Warning**: Fondo naranja `#FF9800`, advertencias

### Tarjetas
- Fondo: `#1A1A1A`
- Borde: `#2A2A2A`
- Radio: 12px
- Padding: 24px
- Hover: Border `#363636`

### Inputs
- Fondo: `#1A1A1A`
- Borde: `#2A2A2A`
- Radio: 4px
- Focus: Border `#F77F00`

## Accesibilidad

- Contraste mínimo WCAG AA: 4.5:1 para texto normal
- Contraste mínimo WCAG AA: 3:1 para texto grande
- Estados de foco claramente visibles
- Soporte para lectores de pantalla
- Navegación por teclado completa

## Animaciones

Transiciones suaves con timing consistente:

```css
transition: all 0.2s ease;
```

Efectos hover con elevación:
```css
transform: translateY(-1px);
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
```

## Implementación

### React Native (App Móvil)
Importar desde `src/theme/index.ts`:
```typescript
import { palette, typography, spacing, borderRadius, shadows } from '@/theme';
```

### Admin Panel (Web)
Usar CSS variables definidas en `src/ui/styles.css`:
```css
var(--color-primary)
var(--spacing-md)
var(--radius-md)
```

## Recursos

- Logo: `LOGO MUSEO.ai`
- Paleta: `PALETA DE COLORES 2025.ai`
- Guía Visual: `Guía Visual Museo del Vallenato_ 2025.pdf`
- Fuentes: `Fuentes/` (Aristotelica, Roboto, Archivo, Barlow, Product Sans)
