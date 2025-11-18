# 🎵 Museo del Vallenato - Fonoteca Digital

Sistema completo de gestión y reproducción offline de la colección musical del Museo del Vallenato en Valledupar, Colombia.

## 📋 Descripción

Aplicación multiplataforma (Android/iOS/Web) tipo Spotify para tablets de museo, que permite a los visitantes explorar y reproducir la extensa colección de música vallenata de forma offline. Incluye un panel de administración web para la gestión de álbumes, pistas y sincronización de contenido.

## 🚀 Instalación Rápida

```bash
# Instalar dependencias
npm install

# Iniciar todos los servicios
npm run dev
```

Servicios disponibles:
- **Admin API**: http://localhost:5050
- **Admin Web**: http://localhost:5173
- **Expo Web**: http://localhost:8081

## 📁 Estructura del Proyecto

```
FONOTECA/
├── admin-panel/           # Panel de administración
├── app-museo-vallenato/   # App móvil Expo
├── tools/                 # Scripts de utilidad
├── Fuentes/               # Tipografías institucionales
└── DESIGN_SYSTEM.md       # Sistema de diseño
```

## 🎨 Sistema de Diseño

Basado en la identidad visual del Museo del Vallenato 2025.

**Colores:**
- Primary: `#F77F00` | Secondary: `#FFB703`
- Background: `#0A0A0A` | Surface: `#1A1A1A`

**Tipografía:**
- Archivo (Bold, SemiBold, Regular)

Ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) para más detalles.

## 🔧 API REST

**Endpoints principales:**
- `GET /api/albums` - Listar álbumes
- `POST /api/albums/import` - Importación masiva
- `POST /api/albums/import-covers` - Importar carátulas
- `POST /api/generate` - Generar assets
- `GET /api/library` - Biblioteca completa

## 📦 Importación de Contenido

### Carátulas desde directorios

```bash
curl -X POST http://localhost:5050/api/albums/import-covers \
  -H "Content-Type: application/json" \
  -d '{
    "sourceDir": "D:/Agency/MUSEO/FONOTECA",
    "folderOffsets": {
      "CARATULAS  1": 0,
      "CARATULAS 2": 100,
      "CARATULAS 3": 200
    }
  }'
```

## 🧪 Desarrollo

```bash
# Admin Panel
cd admin-panel
npm run server    # Backend
npm run dev       # Frontend

# App Móvil
cd app-museo-vallenato
npm run web       # Expo web
npm run android   # Android
```

## 📄 Licencia

Copyright © 2025 Museo del Vallenato. Todos los derechos reservados.

---

**Versión:** 1.0.0 | **Actualización:** Noviembre 2025
