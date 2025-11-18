/**
 * Smart Audio to Album Association
 * Uses intelligent matching based on song titles, artists, and album descriptions
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

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Normalize string for comparison
 */
function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract artist names from string
 */
function extractArtists(str) {
  const normalized = normalize(str);
  const artists = [];
  
  // Common vallenato artists
  const knownArtists = [
    'diomedes diaz', 'diomedes', 
    'rafael orozco', 'orozco',
    'jorge onate', 'onate',
    'hermanos zuleta', 'zuleta', 'poncho zuleta',
    'binomio de oro', 'binomio',
    'ivan villazon', 'villazon',
    'silvestre dangond', 'silvestre',
    'alejandro duran', 'alejo duran',
    'alfredo gutierrez',
    'beto zabaleta',
    'silvio brito',
    'colacho mendoza', 'nicolas mendoza',
    'juancho rois',
    'elberto lopez'
  ];
  
  for (const artist of knownArtists) {
    if (normalized.includes(artist)) {
      artists.push(artist);
    }
  }
  
  return artists;
}

/**
 * Calculate similarity score between track and album
 */
function calculateMatchScore(track, album) {
  let score = 0;
  
  const trackTitle = normalize(track.title);
  const trackArtist = normalize(track.artist);
  const albumTitle = normalize(album.title);
  const albumArtist = normalize(album.artist);
  const albumDesc = normalize(album.description || '');
  
  // Extract artists from track and album
  const trackArtists = extractArtists(trackArtist);
  const albumArtists = extractArtists(albumArtist + ' ' + albumDesc);
  
  // Check if main artist matches (high score)
  const mainArtistMatch = trackArtists.some(ta => albumArtists.includes(ta));
  if (mainArtistMatch) {
    score += 50;
  }
  
  // Check if track title appears in album title or description
  if (albumTitle.includes(trackTitle) || trackTitle.includes(albumTitle)) {
    score += 30;
  }
  
  // Check for title words in description
  const trackWords = trackTitle.split(' ').filter(w => w.length > 3);
  const descWords = albumDesc.split(' ');
  const matchingWords = trackWords.filter(w => descWords.includes(w));
  score += matchingWords.length * 5;
  
  // Check for accordionist/partner matches
  if (trackArtist.includes('colacho') && albumDesc.includes('colacho')) score += 20;
  if (trackArtist.includes('juancho') && albumDesc.includes('juancho')) score += 20;
  if (trackArtist.includes('elberto') && albumDesc.includes('elberto')) score += 20;
  
  // Genre bonus if album year matches expected era
  const year = parseInt(album.year);
  if (!isNaN(year)) {
    // Diomedes early albums (1976-1985)
    if (albumArtists.includes('diomedes') || albumArtists.includes('diomedes diaz')) {
      if (year >= 1976 && year <= 1985 && trackArtist.includes('diomedes')) {
        score += 10;
      }
    }
  }
  
  return score;
}

/**
 * Find best matching album for a track
 */
function findBestMatch(track, albums) {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const album of albums) {
    const score = calculateMatchScore(track, album);
    
    if (score > bestScore && score >= 50) { // Minimum threshold
      bestScore = score;
      bestMatch = album;
    }
  }
  
  return bestMatch ? { album: bestMatch, score: bestScore } : null;
}

/**
 * Re-associate all tracks with better matching
 */
async function smartReassociate() {
  const albums = readJson(ALBUMS_FILE);
  const tracks = readJson(TRACKS_FILE);
  
  if (albums.length === 0) {
    console.error('No albums found.');
    process.exit(1);
  }
  
  const stats = {
    total: tracks.length,
    previouslyAssociated: tracks.filter(t => t.albumId).length,
    newAssociations: 0,
    improved: 0,
    unmatched: 0,
    highConfidence: 0, // score >= 70
    mediumConfidence: 0, // score >= 50 && < 70
  };
  
  const changes = [];
  
  for (const track of tracks) {
    const previousAlbumId = track.albumId;
    const match = findBestMatch(track, albums);
    
    if (match) {
      track.albumId = match.album.id;
      
      if (match.score >= 70) {
        stats.highConfidence++;
      } else {
        stats.mediumConfidence++;
      }
      
      if (previousAlbumId !== match.album.id) {
        stats.improved++;
        changes.push({
          track: track.title,
          artist: track.artist,
          from: albums.find(a => a.id === previousAlbumId)?.title || 'none',
          to: match.album.title,
          score: match.score
        });
      }
      
      if (!previousAlbumId) {
        stats.newAssociations++;
      }
    } else {
      track.albumId = null;
      stats.unmatched++;
    }
  }
  
  writeJson(TRACKS_FILE, tracks);
  
  // Print results
  console.log('\n=== Smart Re-Association Complete ===\n');
  console.log(`Total tracks: ${stats.total}`);
  console.log(`Previously associated: ${stats.previouslyAssociated}`);
  console.log(`New associations: ${stats.newAssociations}`);
  console.log(`Improved matches: ${stats.improved}`);
  console.log(`High confidence (≥70): ${stats.highConfidence}`);
  console.log(`Medium confidence (50-69): ${stats.mediumConfidence}`);
  console.log(`Unmatched: ${stats.unmatched} (${Math.round(stats.unmatched/stats.total*100)}%)\n`);
  
  if (changes.length > 0) {
    console.log('Sample changes (first 20):');
    changes.slice(0, 20).forEach(change => {
      console.log(`  "${change.track}" by ${change.artist}`);
      console.log(`    From: ${change.from} → To: ${change.to} (score: ${change.score})`);
    });
    
    if (changes.length > 20) {
      console.log(`  ... and ${changes.length - 20} more changes`);
    }
  }
  
  console.log('\n✓ Tracks updated in:', TRACKS_FILE);
}

// Execute
smartReassociate().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
