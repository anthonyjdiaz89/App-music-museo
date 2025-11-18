# Panel Admin – Museo del Vallenato

Panel web + servidor para:
- Subir carátulas (covers) y audio (mp3)
- Crear/editar álbumes y pistas
- Generar los assets estáticos para la app Expo (carátulas, audio y library.json) para uso 100% offline

## Scripts
- `npm run server` – Inicia el API (Express)
- `npm run dev:server` – API en modo watch (nodemon)
- `npm run web` – Inicia el panel web (Vite)
- `npm run build:web` – Compila el panel web
- `npm run generate` – Genera assets en `app-museo-vallenato/assets/*`

## Estructura
```
admin-panel/
  server/            # API Express (uploads + CRUD simple + generar)
  src/               # UI React (Vite)
  data/              # Estado (albums.json, tracks.json)
  uploads/
    audio/           # MP3 subidos
    covers/          # Portadas subidas
  tools/
    generateAssets.mjs
```

## Flujo de trabajo
1) Arranca el API: `npm run dev:server`
2) Arranca el panel: `npm run web`
3) Desde la UI: crea Álbumes y pistas (sube carátulas y mp3)
4) Pulsa “Generar assets para la app” para escribir:
   - `app-museo-vallenato/assets/covers/map.ts`
   - `app-museo-vallenato/assets/audio/map.ts`
   - `app-museo-vallenato/assets/data/library.json`
5) Abre/recarga la app Expo (modo web o dispositivo). Todo el audio quedará embebido (offline).

> Nota: el generador nunca borra archivos existentes de la app; sólo copia/actualiza los necesarios según `data/*.json`.