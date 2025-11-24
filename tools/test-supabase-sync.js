/**
 * Supabase Sync Test Script
 * Test the MCP synchronization with Supabase
 */

require('dotenv').config();
const supabaseMCP = require('../server/supabase-mcp');

async function testSync() {
    console.log('🧪 Testing Supabase MCP Connection...\n');

    try {
        // Test 1: Check connection status
        console.log('1️⃣ Checking connection status...');
        const status = await supabaseMCP.getSyncStatus();

        if (status.connected) {
            console.log('✅ Connected to Supabase!');
            console.log(`   Local: ${status.local.albums} albums, ${status.local.tracks} tracks`);
            console.log(`   Remote: ${status.remote.albums} albums, ${status.remote.tracks} tracks\n`);
        } else {
            console.log('❌ Not connected to Supabase');
            console.log('   Error:', status.error);
            console.log('\n⚠️  Please check your .env configuration\n');
            return;
        }

        // Test 2: Ask user what to do
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('\nWhat would you like to do?\n1. Push local data to Supabase\n2. Pull data from Supabase\n3. Full bidirectional sync\n4. Exit\n\nChoice (1-4): ', async (answer) => {
            console.log('');

            switch (answer.trim()) {
                case '1':
                    console.log('📤 Pushing local data to Supabase...');
                    const pushResult = await supabaseMCP.syncAlbumsToSupabase();
                    const pushTracks = await supabaseMCP.syncTracksToSupabase();
                    console.log(`✅ Push complete: ${pushResult.synced} albums, ${pushTracks.synced} tracks\n`);
                    break;

                case '2':
                    console.log('📥 Pulling data from Supabase...');
                    const pullResult = await supabaseMCP.pullAlbumsFromSupabase();
                    const pullTracks = await supabaseMCP.pullTracksFromSupabase();
                    console.log(`✅ Pull complete: ${pullResult.pulled} albums, ${pullTracks.pulled} tracks\n`);
                    break;

                case '3':
                    console.log('🔄 Running full bidirectional sync...');
                    const fullResult = await supabaseMCP.fullSync();
                    console.log('✅ Full sync complete!');
                    console.log(`   Pushed: ${fullResult.push.albums.synced} albums, ${fullResult.push.tracks.synced} tracks`);
                    console.log(`   Pulled: ${fullResult.pull.albums.pulled} albums, ${fullResult.pull.tracks.pulled} tracks\n`);
                    break;

                case '4':
                    console.log('👋 Goodbye!\n');
                    break;

                default:
                    console.log('❌ Invalid choice\n');
            }

            readline.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check that .env file exists and has correct credentials');
        console.error('   2. Verify Supabase project is running');
        console.error('   3. Make sure you ran the SQL schema in Supabase');
        console.error('   4. Check your internet connection\n');
        process.exit(1);
    }
}

// Run the test
testSync();
