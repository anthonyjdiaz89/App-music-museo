import { Genre } from '../../domain/types';

export const GENRES: Genre[] = ['Merengue', 'Paseo', 'Puya', 'Son'];

export const GENRE_ICONS: Record<Genre, string> = {
  'Merengue': '🎵',
  'Paseo': '🎶',
  'Puya': '🎼',
  'Son': '♪',
};

export const GENRE_COLORS: Record<Genre, string> = {
  'Merengue': '#FFE5CC',
  'Paseo': '#FFE0CC',
  'Puya': '#FFEACC',
  'Son': '#FFD5CC',
};
