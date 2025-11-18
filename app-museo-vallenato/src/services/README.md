# AudioService - Servicio Centralizado de Audio

## Descripción

`AudioService` es un servicio singleton que centraliza toda la lógica de reproducción de audio en la aplicación. Proporciona una interfaz consistente para controlar la reproducción, gestionar colas de reproducción y manejar diferentes modos de reproducción.

## Características

### ✨ Funcionalidades Principales

- **Reproducción básica**: Play, pause, stop, toggle
- **Control de posición**: Seek a cualquier punto del audio
- **Cola de reproducción**: Manejo de listas de tracks
- **Navegación**: Siguiente, anterior con lógica inteligente
- **Modos de reproducción**:
  - `NORMAL`: Reproducción secuencial
  - `REPEAT_ONE`: Repetir track actual
  - `REPEAT_ALL`: Repetir toda la cola
  - `SHUFFLE`: Reproducción aleatoria
- **Estado reactivo**: Patrón Observer para notificar cambios
- **Gestión de errores**: Manejo robusto de errores
- **Audio en segundo plano**: Configurado para iOS y Android

## Uso

### 1. Acceso al Servicio (Recomendado: Usar AudioContext)

```typescript
import { useAudio } from '../contexts/AudioContext';

function MyComponent() {
  const { 
    currentTrack, 
    isPlaying, 
    position, 
    duration,
    playTrack, 
    togglePlayPause,
    playNext,
    playPrevious 
  } = useAudio();
  
  // Usar las funciones del contexto
}
```

### 2. Acceso Directo al Servicio (Casos especiales)

```typescript
import AudioService from '../services/AudioService';

const audioService = AudioService.getInstance();

// Reproducir un track
await audioService.playTrack(track);

// Toggle play/pause
await audioService.togglePlayPause();

// Configurar cola
audioService.setQueue(tracks, 0);

// Reproducir siguiente
await audioService.playNext();
```

### 3. Suscribirse a Cambios de Estado

```typescript
const audioService = AudioService.getInstance();

const unsubscribe = audioService.subscribe((state) => {
  console.log('Estado actual:', state);
  console.log('Track:', state.currentTrack?.title);
  console.log('Playing:', state.isPlaying);
  console.log('Position:', state.position);
});

// Cuando termines, desuscribirte
unsubscribe();
```

## API Reference

### Métodos Principales

#### `playTrack(track: Track, autoPlay?: boolean): Promise<void>`
Carga y reproduce un track.

```typescript
await audioService.playTrack(track, true); // auto-reproduce
await audioService.playTrack(track, false); // solo carga
```

#### `play(): Promise<void>`
Reproduce el audio actual.

#### `pause(): Promise<void>`
Pausa el audio actual.

#### `togglePlayPause(): Promise<void>`
Alterna entre play y pause.

#### `stop(): Promise<void>`
Detiene y limpia el audio actual.

#### `seekTo(positionMillis: number): Promise<void>`
Busca a una posición específica en milisegundos.

```typescript
await audioService.seekTo(30000); // 30 segundos
```

#### `setQueue(tracks: Track[], startIndex?: number): void`
Configura la cola de reproducción.

```typescript
audioService.setQueue(allTracks, 5); // Inicia en el índice 5
```

#### `playNext(): Promise<void>`
Reproduce el siguiente track según el modo de reproducción.

#### `playPrevious(): Promise<void>`
Reproduce el track anterior. Si han pasado más de 3 segundos, reinicia el actual.

#### `setPlaybackMode(mode: PlaybackMode): void`
Cambia el modo de reproducción.

```typescript
import { PlaybackMode } from '../services/AudioService';

audioService.setPlaybackMode(PlaybackMode.SHUFFLE);
```

### Estado (AudioState)

```typescript
interface AudioState {
  currentTrack: Track | null;      // Track actual
  isPlaying: boolean;               // Si está reproduciéndose
  isLoaded: boolean;                // Si el audio está cargado
  position: number;                 // Posición en milisegundos
  duration: number;                 // Duración total en milisegundos
  error: string | null;             // Mensaje de error si existe
  playbackMode: PlaybackMode;       // Modo de reproducción actual
  queue: Track[];                   // Cola de reproducción
  currentIndex: number;             // Índice actual en la cola
}
```

### Modos de Reproducción

```typescript
enum PlaybackMode {
  NORMAL = 'NORMAL',           // Secuencial, termina al final
  REPEAT_ONE = 'REPEAT_ONE',   // Repite el track actual
  REPEAT_ALL = 'REPEAT_ALL',   // Repite toda la cola
  SHUFFLE = 'SHUFFLE',         // Aleatorio
}
```

## Arquitectura

### Patrón Singleton
Solo existe una instancia del servicio en toda la aplicación, garantizando un estado consistente.

### Patrón Observer
Los componentes se suscriben a cambios de estado y reciben notificaciones automáticas.

```
┌─────────────────┐
│  AudioService   │ (Singleton)
│   (Subject)     │
└────────┬────────┘
         │
         │ notifica cambios
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼──┐  ┌──▼───┐ ┌──▼───┐ ┌──▼───┐
│ Home │  │Player│ │MiniPIP│ │ Otros│
│Screen│  │Screen│ │       │ │      │
└──────┘  └──────┘ └──────┘ └──────┘
(Observers - se suscriben vía AudioContext)
```

### Flujo de Datos

```
Usuario acciona → useAudio() → AudioService → Actualiza estado
                     ↑                              ↓
                     └──────── notifica ←───────────┘
```

## Manejo de Errores

El servicio captura y reporta errores de manera centralizada:

```typescript
try {
  await audioService.playTrack(track);
} catch (error) {
  // Error ya está capturado en state.error
  console.error('Error:', error);
}

// O revisar el estado
const { error } = audioService.getState();
if (error) {
  Alert.alert('Error', error);
}
```

## Integración con AudioContext

El `AudioContext` envuelve el `AudioService` y lo expone como un React Context, permitiendo un uso más idiomático en componentes React:

```typescript
// En App.tsx
<AudioProvider>
  <NavigationContainer>
    {/* tu app */}
  </NavigationContainer>
</AudioProvider>

// En componentes
const { playTrack, isPlaying } = useAudio();
```

## Casos de Uso

### 1. Lista de Reproducción Completa

```typescript
function TrackList({ tracks }) {
  const { playTrack, setQueue } = useAudio();
  
  const handlePlayTrack = async (track: Track, index: number) => {
    setQueue(tracks, index); // Configura la cola completa
    await playTrack(track);  // Reproduce desde ese índice
  };
  
  return (
    <FlatList
      data={tracks}
      renderItem={({ item, index }) => (
        <TouchableOpacity onPress={() => handlePlayTrack(item, index)}>
          <Text>{item.title}</Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

### 2. Controles de Navegación

```typescript
function PlayerControls() {
  const { playPrevious, togglePlayPause, playNext, isPlaying } = useAudio();
  
  return (
    <View style={{ flexDirection: 'row' }}>
      <Button title="⏮" onPress={playPrevious} />
      <Button title={isPlaying ? "⏸" : "▶"} onPress={togglePlayPause} />
      <Button title="⏭" onPress={playNext} />
    </View>
  );
}
```

### 3. Barra de Progreso con Seek

```typescript
function ProgressBar() {
  const { position, duration, seekTo } = useAudio();
  
  const handleSeek = (value: number) => {
    const newPosition = value * duration;
    seekTo(newPosition);
  };
  
  return (
    <Slider
      value={duration > 0 ? position / duration : 0}
      onValueChange={handleSeek}
      minimumValue={0}
      maximumValue={1}
    />
  );
}
```

### 4. Selector de Modo de Reproducción

```typescript
import { PlaybackMode } from '../services/AudioService';

function PlaybackModeSelector() {
  const { playbackMode, setPlaybackMode } = useAudio();
  
  const modes = [
    { mode: PlaybackMode.NORMAL, icon: '→', label: 'Normal' },
    { mode: PlaybackMode.REPEAT_ONE, icon: '🔂', label: 'Repetir 1' },
    { mode: PlaybackMode.REPEAT_ALL, icon: '🔁', label: 'Repetir Todo' },
    { mode: PlaybackMode.SHUFFLE, icon: '🔀', label: 'Aleatorio' },
  ];
  
  return (
    <View>
      {modes.map((m) => (
        <Button
          key={m.mode}
          title={`${m.icon} ${m.label}`}
          onPress={() => setPlaybackMode(m.mode)}
          color={playbackMode === m.mode ? '#F77F00' : '#999'}
        />
      ))}
    </View>
  );
}
```

## Ventajas de la Centralización

### ✅ Antes (sin AudioService)
- Lógica duplicada en múltiples componentes
- Estado inconsistente entre pantallas
- Difícil mantener y testear
- Problemas de memoria con múltiples instancias de Audio.Sound

### ✅ Después (con AudioService)
- **Una sola fuente de verdad** para el estado de audio
- **Reutilización** de lógica en toda la app
- **Mantenimiento** simplificado (cambios en un solo lugar)
- **Testing** más fácil (mock del servicio singleton)
- **Performance** mejorado (una sola instancia de Audio.Sound)
- **Sincronización** automática entre componentes
- **Escalabilidad** para nuevas funcionalidades

## Próximas Mejoras

- [ ] Persistencia de cola y posición al cerrar la app
- [ ] Integración con controles de lock screen (iOS/Android)
- [ ] Caché de audio para reproducción offline
- [ ] Ecualización y efectos de audio
- [ ] Letras sincronizadas
- [ ] Historial de reproducción
- [ ] Estadísticas de escucha

## Troubleshooting

### El audio no se reproduce
1. Verificar que el track tiene una fuente válida (localAudioPath o audioUrl)
2. Revisar `state.error` para ver mensaje de error
3. Verificar permisos de audio en el dispositivo

### El estado no se actualiza en los componentes
1. Asegurar que el componente está dentro de `<AudioProvider>`
2. Verificar que estás usando el hook `useAudio()` correctamente

### Problemas con siguiente/anterior
1. Verificar que has configurado la cola con `setQueue()`
2. Revisar el `currentIndex` en el estado

## Soporte

Para reportar bugs o sugerencias, crear un issue en el repositorio del proyecto.
