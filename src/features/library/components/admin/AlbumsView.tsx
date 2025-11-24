import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Platform, Alert, Image } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { palette, spacing, typography } from '../../../../core/config/theme';
import { fetchAlbums, createAlbum, uploadFile, updateCatalogVersion } from '../../services/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AlbumsView() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [year, setYear] = useState('');
  const [coverFile, setCoverFile] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const a = await fetchAlbums();
    setAlbums(a);
    setLoading(false);
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
    if (!title || !artist || !coverFile) {
      Alert.alert('Error', 'Por favor completa los campos requeridos (Título, Artista, Carátula)');
      return;
    }

    setUploading(true);
    try {
      // 1. Comprimir y redimensionar la imagen
      const manipResult = await ImageManipulator.manipulateAsync(
        coverFile.uri,
        [{ resize: { width: 800 } }], // Redimensionar manteniendo aspect ratio
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 2. Upload Cover comprimida
      const coverFilename = `${Date.now()}_${title.replace(/\s+/g, '_')}.jpg`;
      
      let coverBody;
      if (Platform.OS === 'web') {
        const response = await fetch(manipResult.uri);
        coverBody = await response.blob();
      } else {
        const response = await fetch(manipResult.uri);
        coverBody = await response.blob();
      }
      
      await uploadFile('covers', coverFilename, coverBody);

      // 3. Create Album Record
      await createAlbum({
        title,
        artist,
        year: parseInt(year) || new Date().getFullYear(),
        cover_filename: coverFilename,
      });

      // 4. Update Catalog Version
      await updateCatalogVersion();

      Alert.alert('Éxito', 'Álbum creado correctamente');
      
      // Reset form
      setTitle('');
      setArtist('');
      setYear('');
      setCoverFile(null);
      loadData();

    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Error al crear el álbum');
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.row}>
      <View style={styles.coverPlaceholder}>
        <Ionicons name="disc" size={24} color={palette.textTertiary} />
      </View>
      <View style={{flex:1}}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowSubtitle}>{item.artist} • {item.year}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Nuevo Álbum</Text>
        
        <View style={styles.inputGroup}>
          <TextInput 
            style={styles.input} 
            placeholder="Título del Álbum" 
            placeholderTextColor={palette.textTertiary}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput 
            style={styles.input} 
            placeholder="Artista Principal" 
            placeholderTextColor={palette.textTertiary}
            value={artist}
            onChangeText={setArtist}
          />
          <TextInput 
            style={[styles.input, { flex: 0.5 }]} 
            placeholder="Año" 
            placeholderTextColor={palette.textTertiary}
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fileButtons}>
          <TouchableOpacity style={[styles.fileBtn, coverFile && styles.fileBtnActive]} onPress={pickCover}>
            <Ionicons name="image" size={20} color={coverFile ? '#FFF' : palette.primary} />
            <Text style={[styles.fileBtnText, coverFile && styles.fileBtnTextActive]}>
              {coverFile ? coverFile.name : 'Seleccionar Carátula'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
            style={[styles.uploadBtn, uploading && { opacity: 0.7 }]} 
            onPress={handleUpload}
            disabled={uploading}
        >
            {uploading ? (
                <ActivityIndicator color="#FFF" />
            ) : (
                <Text style={styles.uploadBtnText}>CREAR ÁLBUM</Text>
            )}
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Álbumes ({albums.length})</Text>
        {loading ? (
            <ActivityIndicator color={palette.primary} />
        ) : (
            <FlatList
                data={albums}
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
    gap: spacing.md,
  },
  coverPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: palette.background,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
