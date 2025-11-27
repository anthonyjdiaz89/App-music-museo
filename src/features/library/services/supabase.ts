/**
 * Supabase Client for React Native/Expo
 * Handles data synchronization with cloud database
 */

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Fetch all albums from Supabase
 */
export async function fetchAlbums() {
  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .order("caratula_number", { ascending: true });

    if (error) throw error;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      coverFilename: row.cover_filename,
      year: row.year,
      description: row.description,
      caratulaNumber: row.caratula_number,
    }));
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
}

/**
 * Fetch all tracks from Supabase
 */
export async function fetchTracks() {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("title", { ascending: true });

    if (error) throw error;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      genre: row.genre,
      albumId: row.album_id,
      audioFilename: row.audio_filename,
    }));
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return [];
  }
}

/**
 * Fetch tracks for a specific album
 */
export async function fetchAlbumTracks(albumId: string) {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .eq("album_id", albumId)
      .order("title", { ascending: true });

    if (error) throw error;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      genre: row.genre,
      albumId: row.album_id,
      audioFilename: row.audio_filename,
    }));
  } catch (error) {
    console.error("Error fetching album tracks:", error);
    return [];
  }
}

/**
 * Subscribe to real-time changes on albums
 */
export function subscribeToAlbums(callback: (payload: any) => void) {
  const channel = supabase
    .channel("albums-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "albums" },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to real-time changes on tracks
 */
export function subscribeToTracks(callback: (payload: any) => void) {
  const channel = supabase
    .channel("tracks-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tracks" },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from real-time channel
 */
export async function unsubscribe(channel: any) {
  if (channel) {
    await supabase.removeChannel(channel);
  }
}

/**
 * Search tracks by title or artist
 */
export async function searchTracks(query: string) {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
      .limit(50);

    if (error) throw error;

    return data.map((row) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      genre: row.genre,
      albumId: row.album_id,
      audioFilename: row.audio_filename,
    }));
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
}

/**
 * Get library with albums and tracks combined
 */
export async function getLibrary() {
  try {
    const albums = await fetchAlbums();
    const tracks = await fetchTracks();

    return {
      albums,
      tracks,
      items: tracks.map((track) => {
        const album = albums.find((a) => a.id === track.albumId);
        return {
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: album?.title || null,
          genre: track.genre,
          audioUrl: track.audioFilename || "",
          imageUrl: album?.coverFilename || null,
        };
      }),
    };
  } catch (error) {
    console.error("Error getting library:", error);
    return { albums: [], tracks: [], items: [] };
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(bucket: string, path: string, file: any) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      // Mejora del mensaje de error para buckets faltantes
      if (error.message.includes("Bucket not found")) {
        throw new Error(
          `El bucket "${bucket}" no existe en tu proyecto de Supabase. Por favor créalo en el Dashboard > Storage.`
        );
      }
      // Mejora del mensaje de error para permisos (RLS)
      if (error.message.includes("row-level security policy")) {
        throw new Error(
          `Permiso denegado. Necesitas configurar una "Policy" en el bucket "${bucket}" que permita INSERT/UPDATE a usuarios públicos (anon).`
        );
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Create a new track
 */
export async function createTrack(track: any) {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .insert([track])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating track:", error);
    throw error;
  }
}

/**
 * Create a new album
 */
export async function createAlbum(album: any) {
  try {
    const { data, error } = await supabase
      .from("albums")
      .insert([album])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating album:", error);
    throw error;
  }
}

/**
 * Update catalog version
 */
export async function updateCatalogVersion() {
  try {
    // First get current version
    const { data: current } = await supabase
      .from("catalog_version")
      .select("version")
      .single();

    const newVersion = (current?.version || 0) + 1;

    const { data, error } = await supabase
      .from("catalog_version")
      .upsert({
        id: 1,
        version: newVersion,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating catalog version:", error);
    throw error;
  }
}
