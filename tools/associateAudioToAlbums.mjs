/**
 * Associate Audio Files to Albums
 * Scans audio files from genre folders and creates tracks associated with existing albums
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'admin-panel', 'data');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');
const AUDIO_SOURCE = path.join(ROOT, 'Canciones Vallenatas');

const GENRES = ['Merengues', 'Paseos', 'Puyas', 'Sones'];

/**
 * Read JSON file with error handling
 */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

/**
 * Write JSON file
 */
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Generate unique track ID
 */
function generateTrackId() {
  return 'trk_' + Math.random().toString(36).slice(2, 9);
}

/**
 * Normalize string for comparison (remove accents, lowercase)
 */
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse audio filename to extract metadata
 * Examples:
 * - "A Mi Papá, Diomedes Díaz - Colacho Mendoza.mp3"
 * - "Diomedes Diaz - El Cambio.mp3"
 * - "Jorge Oñate - La Creciente.mp3"
 */
function parseAudioFilename(filename) {
  const nameWithoutExt = filename.replace(/\.mp3$/i, '');
  
  // Pattern: "Title, Artist - Acordeonist" or "Title, Artist"
  let match = nameWithoutExt.match(/^([^,]+),\s*(.+?)(?:\s*-\s*(.+))?$/);
  if (match) {
    return {
      title: match[1].trim(),
      artist: match[2].trim(),
      acordeonist: match[3] ? match[3].trim() : null
    };
  }
  
  // Pattern: "Artist - Title"
  match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+)$/);
  if (match) {
    return {
      title: match[2].trim(),
      artist: match[1].trim(),
      acordeonist: null
    };
  }
  
  // Fallback: entire filename is title
  return {
    title: nameWithoutExt.trim(),
    artist: 'Desconocido',
    acordeonist: null
  };
}

/**
 * Find best matching album for a track
 */
function findMatchingAlbum(trackInfo, albums) {
  const trackArtistNorm = normalize(trackInfo.artist);
  const trackTitleNorm = normalize(trackInfo.title);
  
  // First try: exact artist match
  let matches = albums.filter(album => {
    const albumArtistNorm = normalize(album.artist || '');
    return albumArtistNorm.includes(trackArtistNorm) || trackArtistNorm.includes(albumArtistNorm);
  });
  
  if (matches.length === 1) return matches[0].id;
  if (matches.length > 1) {
    // Multiple matches, try to find by title in description
    const titleMatch = matches.find(album => {
      const descNorm = normalize(album.description || '');
      return descNorm.includes(trackTitleNorm);
    });
    if (titleMatch) return titleMatch.id;
    
    // Return first match if no title match
    return matches[0].id;
  }
  
  // Try to find by artist name in description
  matches = albums.filter(album => {
    const descNorm = normalize(album.description || '');
    return descNorm.includes(trackArtistNorm);
  });
  
  if (matches.length > 0) return matches[0].id;
  
  // No match found
  return null;
}

/**
 * Main function to associate audio files to albums
 */
async function associateAudio() {
  const albums = readJson(ALBUMS_FILE);
  const existingTracks = readJson(TRACKS_FILE);
  
  if (albums.length === 0) {
    console.error('No albums found. Please import albums first.');
    process.exit(1);
  }
  
  const newTracks = [];
  const stats = {
    total: 0,
    associated: 0,
    unmatched: 0,
    byGenre: {}
  };
  
  for (const genre of GENRES) {
    const genrePath = path.join(AUDIO_SOURCE, genre);
    if (!fs.existsSync(genrePath)) {
      console.warn(`Genre folder not found: ${genre}`);
      continue;
    }
    
    stats.byGenre[genre] = { total: 0, associated: 0, unmatched: 0 };
    
    const files = fs.readdirSync(genrePath)
      .filter(f => /\.mp3$/i.test(f));
    
    for (const file of files) {
      stats.total++;
      stats.byGenre[genre].total++;
      
      // Skip if track already exists
      const existingTrack = existingTracks.find(t => t.audioFilename === file);
      if (existingTrack) {
        stats.associated++;
        stats.byGenre[genre].associated++;
        continue;
      }
      
      const trackInfo = parseAudioFilename(file);
      const albumId = findMatchingAlbum(trackInfo, albums);
      
      const track = {
        id: generateTrackId(),
        title: trackInfo.title,
        artist: trackInfo.acordeonist 
          ? `${trackInfo.artist} - ${trackInfo.acordeonist}`
          : trackInfo.artist,
        genre: genre.replace(/s$/, ''), // Remove plural (Merengues -> Merengue)
        albumId: albumId,
        audioFilename: file
      };
      
      newTracks.push(track);
      
      if (albumId) {
        stats.associated++;
        stats.byGenre[genre].associated++;
      } else {
        stats.unmatched++;
        stats.byGenre[genre].unmatched++;
      }
    }
  }
  
  // Merge with existing tracks
  const allTracks = [...existingTracks, ...newTracks];
  writeJson(TRACKS_FILE, allTracks);
  
  // Print statistics
  console.log('\n=== Audio Association Complete ===\n');
  console.log(`Total audio files processed: ${stats.total}`);
  console.log(`Successfully associated: ${stats.associated} (${Math.round(stats.associated/stats.total*100)}%)`);
  console.log(`Unmatched (no album): ${stats.unmatched} (${Math.round(stats.unmatched/stats.total*100)}%)`);
  console.log(`New tracks created: ${newTracks.length}`);
  console.log(`Total tracks in database: ${allTracks.length}\n`);
  
  console.log('By Genre:');
  for (const [genre, genreStats] of Object.entries(stats.byGenre)) {
    console.log(`  ${genre}: ${genreStats.total} files, ${genreStats.associated} associated, ${genreStats.unmatched} unmatched`);
  }
  
  // Show sample unmatched tracks
  const unmatchedTracks = newTracks.filter(t => !t.albumId).slice(0, 10);
  if (unmatchedTracks.length > 0) {
    console.log('\nSample unmatched tracks (first 10):');
    unmatchedTracks.forEach(t => {
      console.log(`  - "${t.title}" by ${t.artist} [${t.genre}]`);
    });
  }
  
  console.log('\n✓ Tracks saved to:', TRACKS_FILE);
}

// Execute
associateAudio().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
