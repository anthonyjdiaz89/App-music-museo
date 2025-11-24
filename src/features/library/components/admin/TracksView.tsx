import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { palette, spacing, typography } from '../../../../core/config/theme';
import { fetchTracks, fetchAlbums, createTrack, uploadFile, updateCatalogVersion } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function TracksView() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('Paseo');
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [coverFile, setCoverFile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [t, a] = await Promise.all([fetchTracks(), fetchAlbums()]);
    setTracks(t);
    setAlbums(a);
    setLoading(false);
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setAudioFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking audio:', err);
    }
  };

  const pickCover = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        setCoverFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking cover:', err);
    }
  };

  const handleUpload = async () => {
    if (!title || !artist || !audioFile) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (Título, Artista, Audio)');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload Audio
      const audioExt = audioFile.name.split('.').pop();
      const audioFilename = `${Date.now()}_${title.replace(/\s+/g, '_')}.${audioExt}`;
      
      // On web, we need the file object directly. On native, we might need to read it as blob/base64
      // Supabase JS client handles File object on web.
      let audioBody = audioFile.file; 
      if (Platform.OS !== 'web') {
         // Native implementation would require reading file to blob
         const response = await fetch(audioFile.uri);
         audioBody = await response.blob();
      }

      await uploadFile('audios', audioFilename, audioBody);

      // 2. Upload Cover (Optional)
      let coverFilename = null;
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        coverFilename = `${Date.now()}_cover.${coverExt}`;
        
        let coverBody = coverFile.file;
        if (Platform.OS !== 'web') {
            const response = await fetch(coverFile.uri);
            coverBody = await response.blob();
        }
        
        await uploadFile('covers', coverFilename, coverBody);
      }

      // 3. Create Track Record
      await createTrack({
        title,
        artist,
        genre,
        album_id: selectedAlbum,
        audio_filename: audioFilename,
        // If we had a cover specific to track, we'd save it, but usually it's album cover
        // For now assuming tracks table has what we need.
      });

      // 4. Update Catalog Version
      await updateCatalogVersion();

      Alert.alert('Éxito', 'Canción subida correctamente');
      
      // Reset form
      setTitle('');
      setArtist('');
      setAudioFile(null);
      setCoverFile(null);
      loadData();

    } catch (error: any) {
      console.error('Upload error:', error);
      // El mensaje de error ya viene formateado desde supabase.ts si es un error conocido
      Alert.alert('Error', error.message || 'Error al subir la canción');
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={{flex:1}}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle}>{item.artist} • {item.genre}</Text>
      </View>
      <Ionicons name="musical-note" size={20} color={palette.textSecondary} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Nueva Canción</Text>
        
        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Título" 
            placeholderTextColor={palette.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Artista" 
            placeholderTextColor={palette.textTertiary}
            value={artist}
            onChangeText={setArtist}
          />
        </View>

        <View style={styles.inputGroup}>
            {/* Simple Genre Selector for now */}
            {['Paseo', 'Merengue', 'Puya', 'Son'].map(g => (
                <TouchableOpacity 
                    key={g} 
                    style={[styles.chip, genre === g && styles.chipActive]}
                    onPress={() => setGenre(g)}
                >
                    <Text style={[styles.chipText, genre === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <View style={styles.fileButtons}>
          <TouchableOpacity style={[styles.fileBtn, audioFile && styles.fileBtnActive]} onPress={pickAudio}>
            <Ionicons name="musical-notes" size={20} color={audioFile ? '#FFF' : palette.primary} />
            <Text style={[styles.fileBtnText, audioFile && styles.fileBtnTextActive]}>
              {audioFile ? audioFile.name : 'Seleccionar Audio'}
            </Text>
          </TouchableOpacity>

          {/* Optional Cover Picker if needed per track, or just rely on Album */}
        </View>

        <TouchableOpacity 
            style={[styles.uploadBtn, uploading && { opacity: 0.7 }]} 
            onPress={handleUpload}
            disabled={uploading}
        >
            {uploading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.uploadBtnText}>SUBIR CANCIÓN</Text>
            )}
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Catálogo ({tracks.length})</Text>
        {loading ? (
            <ActivityIndicator color={palette.primary} />
        ) : (
            <FlatList
                data={tracks}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xl,
  },
  form: {
    backgroundColor: palette.surface,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.sm,
  },
  inputGroup: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: 200,
    backgroundColor: palette.background,
    color: palette.textPrimary,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
  },
  chipActive: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  chipText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  chipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  fileButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  fileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.primary,
    borderStyle: 'dashed',
  },
  fileBtnActive: {
    backgroundColor: palette.primary,
    borderStyle: 'solid',
  },
  fileBtnText: {
    color: palette.primary,
    fontWeight: '600',
  },
  fileBtnTextActive: {
    color: '#FFF',
  },
  uploadBtn: {
    backgroundColor: palette.success,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  uploadBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  rowTitle: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  rowSubtitle: {
    color: palette.textSecondary,
    fontSize: 14,
  },
});
