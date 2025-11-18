# Arquitectura del Servicio de Audio

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN                                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    AudioProvider (Context)                      │   │
│  │  - Envuelve la app en App.tsx                                  │   │
│  │  - Expone hook useAudio()                                      │   │
│  └────────────────┬───────────────────────────────────────────────┘   │
│                   │                                                     │
│                   │ usa internamente                                   │
│                   ▼                                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │            AudioService (Singleton)                             │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Estado:                                                  │ │   │
│  │  │  • currentTrack: Track | null                            │ │   │
│  │  │  • isPlaying: boolean                                    │ │   │
│  │  │  • position: number (ms)                                 │ │   │
│  │  │  • duration: number (ms)                                 │ │   │
│  │  │  • queue: Track[]                                        │ │   │
│  │  │  • currentIndex: number                                  │ │   │
│  │  │  • playbackMode: PlaybackMode                            │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  │  ┌──────────────────────────────────────────────────────────┐ │   │
│  │  │  Métodos:                                                 │ │   │
│  │  │  • playTrack(track, autoPlay?)                           │ │   │
│  │  │  • play() / pause() / stop()                             │ │   │
│  │  │  • togglePlayPause()                                     │ │   │
│  │  │  • seekTo(position)                                      │ │   │
│  │  │  • playNext() / playPrevious()                           │ │   │
│  │  │  • setQueue(tracks, startIndex)                          │ │   │
│  │  │  • setPlaybackMode(mode)                                 │ │   │
│  │  │  • subscribe(listener) - Patrón Observer                 │ │   │
│  │  └──────────────────────────────────────────────────────────┘ │   │
│  └────────────────┬───────────────────────────────────────────────┘   │
│                   │                                                     │
│                   │ notifica cambios                                   │
│                   ▼                                                     │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │                    COMPONENTES                                  │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │ HomeScreen   │  │ PlayerScreen │  │   MiniPIP    │        │   │
│  │  │              │  │              │  │   Player     │        │   │
│  │  │ • Lista de   │  │ • Controles  │  │              │        │   │
│  │  │   tracks     │  │   completos  │  │ • Compacto   │        │   │
│  │  │ • Play/Pause │  │ • Seek bar   │  │ • Flotante   │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │   │
│  │                                                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │   │
│  │  │AudioControls │  │ Otros        │  │ Futuras      │        │   │
│  │  │ (ejemplo)    │  │ Componentes  │  │ Pantallas    │        │   │
│  │  │              │  │              │  │              │        │   │
│  │  │ • Completo   │  │              │  │              │        │   │
│  │  │ • Demo       │  │              │  │              │        │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                            ▲
                            │ usa
                            │
                  ┌─────────┴─────────┐
                  │  expo-av (Audio)  │
                  │  • Audio.Sound    │
                  │  • Reproducción   │
                  └───────────────────┘
```

## Flujo de Datos

### 1. Usuario Reproduce un Track

```
┌──────────┐        ┌──────────────┐        ┌──────────────┐
│ Usuario  │        │  Componente  │        │  useAudio()  │
│          │        │              │        │   (hook)     │
└────┬─────┘        └──────┬───────┘        └──────┬───────┘
     │                     │                       │
     │ tap en track        │                       │
     ├────────────────────►│                       │
     │                     │ playTrack(track)      │
     │                     ├──────────────────────►│
     │                     │                       │
                           │                       ▼
                           │              ┌────────────────┐
                           │              │ AudioService   │
                           │              │ .playTrack()   │
                           │              └────────┬───────┘
                           │                       │
                           │                       │ 1. Detiene audio actual
                           │                       │ 2. Carga nuevo audio
                           │                       │ 3. Inicia reproducción
                           │                       │ 4. Actualiza estado
                           │                       │
                           │                       ▼
                           │              ┌────────────────┐
                           │              │ notifyListeners│
                           │              └────────┬───────┘
                           │                       │
                           │        ┌──────────────┴──────────────┐
                           │        │                             │
                           ▼        ▼                             ▼
                    ┌──────────────────┐                   ┌──────────────┐
                    │  Componente      │                   │   Otros      │
                    │  re-renderiza    │                   │ Componentes  │
                    │                  │                   │ re-renderizan│
                    │ • Muestra nueva  │                   └──────────────┘
                    │   información    │
                    │ • Actualiza UI   │
                    └──────────────────┘
```

### 2. Reproducción con Cola

```
Usuario selecciona playlist
         │
         ▼
    setQueue(tracks, 0)
         │
         ▼
    AudioService almacena:
    • queue: [track1, track2, track3...]
    • currentIndex: 0
         │
         ▼
    playTrack(tracks[0])
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
    Audio se reproduce   Track termina
         │                 │
         │                 ▼
         │           handleTrackFinished()
         │                 │
         │                 ▼
         │           Según playbackMode:
         │           • NORMAL → playNext()
         │           • REPEAT_ONE → seekTo(0)
         │           • REPEAT_ALL → playNext() (loop)
         │           • SHUFFLE → random track
         │                 │
         │                 ▼
         │           Reproduce siguiente
         │                 │
         └─────────────────┘
              (loop continúa)
```

## Patrón Observer en Acción

```
┌─────────────────────────────────────────────────────────────┐
│                    AudioService                              │
│                                                              │
│  listeners = Set([listener1, listener2, listener3...])      │
│                                                              │
│  updateState(newState) {                                    │
│    this.state = { ...this.state, ...newState };            │
│    this.notifyListeners(); // ← Notifica a todos           │
│  }                                                           │
│                                                              │
│  notifyListeners() {                                        │
│    this.listeners.forEach(listener => {                     │
│      listener(this.state); // ← Cada uno recibe el estado  │
│    });                                                       │
│  }                                                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
   │Listener│ │Listener│ │Listener│ │Listener│
   │   1    │ │   2    │ │   3    │ │  ...   │
   └────┬───┘ └────┬───┘ └────┬───┘ └────┬───┘
        │          │          │          │
        ▼          ▼          ▼          ▼
   setState() setState() setState() setState()
        │          │          │          │
        ▼          ▼          ▼          ▼
  Re-render  Re-render  Re-render  Re-render
```

## Modos de Reproducción

```
┌─────────────────────────────────────────────────────────────┐
│                    PlaybackMode                              │
└─────────────────────────────────────────────────────────────┘

1. NORMAL (Secuencial)
   Track 1 → Track 2 → Track 3 → [FIN]

2. REPEAT_ONE (Repetir Actual)
   Track 2 → Track 2 → Track 2 → Track 2 → ...
   (loop infinito)

3. REPEAT_ALL (Repetir Cola)
   Track 1 → Track 2 → Track 3 → Track 1 → Track 2 → ...
   (loop infinito de la cola)

4. SHUFFLE (Aleatorio)
   Track 1 → Track 5 → Track 2 → Track 8 → Track 3 → ...
   (orden aleatorio)
```

## Manejo de Recursos

```
┌─────────────────────────────────────────────────────────────┐
│                  Ciclo de Vida del Audio                     │
└─────────────────────────────────────────────────────────────┘

playTrack(newTrack)
    │
    ▼
┌─────────────┐
│  cleanup()  │ ← Detiene audio actual si existe
│             │   • sound.stopAsync()
│             │   • sound.unloadAsync()
│             │   • sound = null
└─────┬───────┘
      │
      ▼
┌─────────────────┐
│ Crear nuevo     │
│ Audio.Sound     │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Cargar fuente   │ ← Desde audioMap o URL
│ de audio        │
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Configurar      │
│ callbacks       │ ← onPlaybackStatusUpdate
└─────┬───────────┘
      │
      ▼
┌─────────────────┐
│ Reproducir      │
│ sound.playAsync()│
└─────────────────┘

Al desmontar app:
    │
    ▼
destroy()
    │
    ▼
cleanup() + clear listeners
```

## Integración en la App

```
App.tsx
  │
  ├─ ErrorBoundary
  │    │
  │    └─ AudioProvider ← AudioService.getInstance()
  │         │
  │         └─ NavigationContainer
  │              │
  │              └─ Stack.Navigator
  │                   │
  │                   ├─ WelcomeScreen
  │                   ├─ HomeScreen ← useAudio()
  │                   ├─ PlayerScreen ← useAudio()
  │                   └─ SyncScreen
  │
  └─ MiniPIP Player ← useAudio()
```

## Comparación: Antes vs Después

### ANTES (Sin AudioService)
```
HomeScreen.tsx
  ├─ useState(sound)
  ├─ useState(isPlaying)
  ├─ playTrack() { ... lógica ... }
  └─ togglePlayPause() { ... lógica ... }

PlayerScreen.tsx
  ├─ useState(sound)
  ├─ useState(isPlaying)
  ├─ playTrack() { ... lógica duplicada ... }
  └─ togglePlayPause() { ... lógica duplicada ... }

❌ Problemas:
  • Código duplicado
  • Estado desincronizado
  • Múltiples Audio.Sound
  • Difícil de mantener
```

### DESPUÉS (Con AudioService)
```
AudioService.ts (Singleton)
  └─ Toda la lógica centralizada

AudioContext.tsx
  └─ Wrapper delgado sobre AudioService

HomeScreen.tsx
  └─ const { playTrack, isPlaying } = useAudio()

PlayerScreen.tsx
  └─ const { playTrack, isPlaying } = useAudio()

✅ Beneficios:
  • Código centralizado
  • Estado sincronizado
  • Una sola Audio.Sound
  • Fácil de mantener
  • Funcionalidades avanzadas
```

## Extensibilidad

```
┌─────────────────────────────────────────────────────────────┐
│              Futuras Mejoras (Fáciles de Agregar)            │
└─────────────────────────────────────────────────────────────┘

1. Persistencia
   AudioService.saveState() → AsyncStorage
   AudioService.loadState() ← AsyncStorage

2. Historial
   private history: Track[] = []
   addToHistory(track)
   getHistory() → Track[]

3. Caché
   private audioCache: Map<string, Audio.Sound>
   preloadTrack(track)

4. Ecualización
   setEqualizer(preset: EqualizerPreset)
   applyEffect(effect: AudioEffect)

5. Letras
   loadLyrics(track) → Promise<Lyric[]>
   getCurrentLyricLine() → string

6. Estadísticas
   getListenCount(track) → number
   getMostPlayed() → Track[]

Todas estas features se agregan en AudioService
sin tocar los componentes existentes ✅
```
