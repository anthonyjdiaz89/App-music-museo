/**
 * Migrate library.json to albums.json and tracks.json format
 * This converts the existing library data to the new format used by Supabase sync
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LIBRARY_FILE = path.join(DATA_DIR, 'library.json');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');

function generateId(prefix) {
    return prefix + '_' + Math.random().toString(36).slice(2, 11);
}

function extractAlbumFromImageUrl(imageUrl) {
    if (!imageUrl) return null;
    // Try to extract album info from image path
    const match = imageUrl.match(/(\d+)\.\s*([^\/]+)\s+DSC_/);
    if (match) {
        return {
            caratulaNumber: parseInt(match[1], 10),
            title: match[2].trim()
        };
    }
    return null;
}

async function migrate() {
    console.log('🔄 Starting migration from library.json to albums.json + tracks.json...\n');

    // Read library.json
    const library = JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf8'));
    const items = library.items || [];

    console.log(`📚 Found ${items.length} items in library.json\n`);

    // Track unique albums by artist or image
    const albumsMap = new Map();
    const tracks = [];

    for (const item of items) {
        let albumId = null;
        let albumKey = null;

        // Try to identify album from imageUrl
        if (item.imageUrl) {
            albumKey = item.imageUrl;

            if (!albumsMap.has(albumKey)) {
                const albumInfo = extractAlbumFromImageUrl(item.imageUrl);
                const id = generateId('alb');

                albumsMap.set(albumKey, {
                    id,
                    title: albumInfo?.title || item.artist || 'Álbum Desconocido',
                    artist: item.artist || 'Varios',
                    coverFilename: item.imageUrl,
                    year: null,
                    description: null,
                    caratulaNumber: albumInfo?.caratulaNumber || null
                });
            }

            albumId = albumsMap.get(albumKey).id;
        }

        // Create track
        const track = {
            id: generateId('trk'),
            title: item.title || 'Sin Título',
            artist: item.artist || 'Desconocido',
            genre: item.genre || 'Vallenato',
            albumId: albumId,
            audioFilename: item.audioUrl || null
        };

        tracks.push(track);
    }

    const albums = Array.from(albumsMap.values());

    console.log(`✅ Processed:\n`);
    console.log(`   📀 Albums: ${albums.length}`);
    console.log(`   🎵 Tracks: ${tracks.length}\n`);

    // Write to files
    fs.writeFileSync(ALBUMS_FILE, JSON.stringify(albums, null, 2), 'utf8');
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2), 'utf8');

    console.log(`💾 Saved to:\n`);
    console.log(`   ${ALBUMS_FILE}`);
    console.log(`   ${TRACKS_FILE}\n`);

    console.log(`🎉 Migration complete!\n`);
    console.log(`Next steps:`);
    console.log(`   1. Run: npm run test-sync`);
    console.log(`   2. Choose option 1 to push data to Supabase`);
    console.log(`   3. Or run: npm run dev and go to SYNC in admin panel\n`);
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
