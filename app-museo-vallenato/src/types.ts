export type Genre = 'Merengue' | 'Paseo' | 'Puya' | 'Son';
export type Category = 'Historia' | 'Biografías' | 'Instrumentos' | 'Testimonios';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: Genre;
  category?: Category;
  description?: string;
  duration?: string;
  audioUrl: string; // puede ser nombre de archivo o URL absoluta
  imageUrl: string | null; // nombre de archivo o URL
  localAudioPath?: string; // ruta file:// descargada
  localImagePath?: string; // ruta file:// descargada
  audioMD5?: string; // hash md5 para validar integridad
  imageMD5?: string;
}
