/**
 * Supabase MCP Client
 * Model Context Protocol client for synchronizing data with Supabase
 * Provides bidirectional sync between local JSON files and Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

// Paths
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');

/**
 * Read JSON file with error handling
 */
function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
    } catch {
        return [];
    }
}

/**
 * Write JSON to file
 */
function writeJson(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Sync local albums to Supabase
 * @returns {Promise<{synced: number, errors: Array}>}
 */
async function syncAlbumsToSupabase() {
    const albums = readJson(ALBUMS_FILE);
    let synced = 0;
    const errors = [];

    console.log(`📤 Syncing ${albums.length} albums to Supabase...`);

    for (const album of albums) {
        try {
            const { error } = await supabase
                .from('albums')
                .upsert({
                    id: album.id,
                    title: album.title,
                    artist: album.artist,
                    cover_filename: album.coverFilename,
                    year: album.year,
                    description: album.description,
                    caratula_number: album.caratulaNumber,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;
            synced++;
        } catch (err) {
            errors.push({ album: album.id, error: err.message });
        }
    }

    console.log(`✅ Synced ${synced}/${albums.length} albums`);
    return { synced, errors };
}

/**
 * Sync local tracks to Supabase
 * @returns {Promise<{synced: number, errors: Array}>}
 */
async function syncTracksToSupabase() {
    const tracks = readJson(TRACKS_FILE);
    let synced = 0;
    const errors = [];

    console.log(`📤 Syncing ${tracks.length} tracks to Supabase...`);

    for (const track of tracks) {
        try {
            const { error } = await supabase
                .from('tracks')
                .upsert({
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    genre: track.genre,
                    album_id: track.albumId,
                    audio_filename: track.audioFilename,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;
            synced++;
        } catch (err) {
            errors.push({ track: track.id, error: err.message });
        }
    }

    console.log(`✅ Synced ${synced}/${tracks.length} tracks`);
    return { synced, errors };
}

/**
 * Pull albums from Supabase to local
 * @returns {Promise<{pulled: number, errors: Array}>}
 */
async function pullAlbumsFromSupabase() {
    try {
        console.log('📥 Pulling albums from Supabase...');

        const { data, error } = await supabase
            .from('albums')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        const albums = data.map(row => ({
            id: row.id,
            title: row.title,
            artist: row.artist,
            coverFilename: row.cover_filename,
            year: row.year,
            description: row.description,
            caratulaNumber: row.caratula_number,
        }));

        writeJson(ALBUMS_FILE, albums);
        console.log(`✅ Pulled ${albums.length} albums`);

        return { pulled: albums.length, errors: [] };
    } catch (err) {
        return { pulled: 0, errors: [err.message] };
    }
}

/**
 * Pull tracks from Supabase to local
 * @returns {Promise<{pulled: number, errors: Array}>}
 */
async function pullTracksFromSupabase() {
    try {
        console.log('📥 Pulling tracks from Supabase...');

        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        const tracks = data.map(row => ({
            id: row.id,
            title: row.title,
            artist: row.artist,
            genre: row.genre,
            albumId: row.album_id,
            audioFilename: row.audio_filename,
        }));

        writeJson(TRACKS_FILE, tracks);
        console.log(`✅ Pulled ${tracks.length} tracks`);

        return { pulled: tracks.length, errors: [] };
    } catch (err) {
        return { pulled: 0, errors: [err.message] };
    }
}

/**
 * Setup real-time subscriptions for albums and tracks
 */
function setupRealtimeSync() {
    console.log('🔄 Setting up real-time sync...');

    // Subscribe to albums changes
    const albumsChannel = supabase
        .channel('albums-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'albums' },
            async (payload) => {
                console.log('📥 Album changed:', payload);
                await pullAlbumsFromSupabase();
            }
        )
        .subscribe();

    // Subscribe to tracks changes
    const tracksChannel = supabase
        .channel('tracks-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'tracks' },
            async (payload) => {
                console.log('📥 Track changed:', payload);
                await pullTracksFromSupabase();
            }
        )
        .subscribe();

    console.log('✅ Real-time sync enabled');

    return { albumsChannel, tracksChannel };
}

/**
 * Full bidirectional sync
 */
async function fullSync() {
    console.log('🔄 Starting full bidirectional sync...');

    // Push local changes to Supabase
    const albumsUp = await syncAlbumsToSupabase();
    const tracksUp = await syncTracksToSupabase();

    // Pull remote changes to local
    const albumsDown = await pullAlbumsFromSupabase();
    const tracksDown = await pullTracksFromSupabase();

    console.log('✅ Full sync complete');

    return {
        push: { albums: albumsUp, tracks: tracksUp },
        pull: { albums: albumsDown, tracks: tracksDown },
    };
}

/**
 * Get sync status
 */
async function getSyncStatus() {
    try {
        const localAlbums = readJson(ALBUMS_FILE);
        const localTracks = readJson(TRACKS_FILE);

        const { count: remoteAlbumsCount } = await supabase
            .from('albums')
            .select('*', { count: 'exact', head: true });

        const { count: remoteTracksCount } = await supabase
            .from('tracks')
            .select('*', { count: 'exact', head: true });

        return {
            local: {
                albums: localAlbums.length,
                tracks: localTracks.length,
            },
            remote: {
                albums: remoteAlbumsCount || 0,
                tracks: remoteTracksCount || 0,
            },
            connected: true,
        };
    } catch (err) {
        return {
            connected: false,
            error: err.message,
        };
    }
}

module.exports = {
    supabase,
    syncAlbumsToSupabase,
    syncTracksToSupabase,
    pullAlbumsFromSupabase,
    pullTracksFromSupabase,
    setupRealtimeSync,
    fullSync,
    getSyncStatus,
};
