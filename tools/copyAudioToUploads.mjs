/**
 * Copy Audio Files to Uploads
 * Copies audio files from genre folders to admin-panel/uploads/audio/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const AUDIO_SOURCE = path.join(ROOT, 'Canciones Vallenatas');
const AUDIO_DEST = path.join(ROOT, 'admin-panel', 'uploads', 'audio');
const TRACKS_FILE = path.join(ROOT, 'admin-panel', 'data', 'tracks.json');

const GENRES = ['Merengues', 'Paseos', 'Puyas', 'Sones'];

// Ensure destination exists
if (!fs.existsSync(AUDIO_DEST)) {
  fs.mkdirSync(AUDIO_DEST, { recursive: true });
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

async function copyAudioFiles() {
  const tracks = readJson(TRACKS_FILE);
  let copied = 0;
  let skipped = 0;
  let errors = 0;
  
  console.log('Copying audio files to uploads...\n');
  
  for (const genre of GENRES) {
    const genrePath = path.join(AUDIO_SOURCE, genre);
    if (!fs.existsSync(genrePath)) continue;
    
    // Get all audio files referenced in tracks for this genre
    const genreTracks = tracks.filter(t => t.audioFilename);
    
    for (const track of genreTracks) {
      const destPath = path.join(AUDIO_DEST, track.audioFilename);
      
      // Skip if already exists
      if (fs.existsSync(destPath)) {
        skipped++;
        continue;
      }
      
      // Try to find the file in genre folders
      for (const genreFolder of GENRES) {
        const sourcePath = path.join(AUDIO_SOURCE, genreFolder, track.audioFilename);
        if (fs.existsSync(sourcePath)) {
          try {
            fs.copyFileSync(sourcePath, destPath);
            copied++;
            if (copied % 10 === 0) {
              process.stdout.write(`\rCopied: ${copied}, Skipped: ${skipped}, Errors: ${errors}`);
            }
            break;
          } catch (e) {
            errors++;
            console.error(`\nError copying ${track.audioFilename}: ${e.message}`);
          }
        }
      }
    }
  }
  
  console.log(`\n\n=== Copy Complete ===`);
  console.log(`Copied: ${copied} files`);
  console.log(`Skipped (already exist): ${skipped} files`);
  console.log(`Errors: ${errors} files`);
  console.log(`\nAudio files ready in: ${AUDIO_DEST}`);
}

copyAudioFiles().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
