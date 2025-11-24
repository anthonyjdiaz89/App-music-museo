-- Museo del Vallenato - Supabase Schema
-- Execute this in Supabase SQL Editor to create tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Albums Table
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_filename TEXT,
  year TEXT,
  description TEXT,
  caratula_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks Table
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT,
  album_id TEXT REFERENCES albums(id) ON DELETE SET NULL,
  audio_filename TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_albums_caratula ON albums(caratula_number);
CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);

-- Enable Row Level Security (RLS)
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Allow public read access to albums"
  ON albums FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to tracks"
  ON tracks FOR SELECT
  TO public
  USING (true);

-- Policies for authenticated write access
CREATE POLICY "Allow authenticated insert on albums"
  ON albums FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on albums"
  ON albums FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on albums"
  ON albums FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on tracks"
  ON tracks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on tracks"
  ON tracks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on tracks"
  ON tracks FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE albums;
ALTER PUBLICATION supabase_realtime ADD TABLE tracks;

-- Comments for documentation
COMMENT ON TABLE albums IS 'Music albums catalog for Museo del Vallenato';
COMMENT ON TABLE tracks IS 'Music tracks linked to albums';
COMMENT ON COLUMN albums.caratula_number IS 'Physical cover number in museum archive';
COMMENT ON COLUMN tracks.audio_filename IS 'Audio file name stored in server/uploads/audio';
COMMENT ON COLUMN albums.cover_filename IS 'Cover image file name stored in server/uploads/covers';
