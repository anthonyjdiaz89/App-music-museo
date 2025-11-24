import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing } from '../../../core/config/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onClear }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color={palette.textSecondary} style={styles.icon} />
      <TextInput
        placeholder="Buscar canción, artista, género o palabra clave..."
        placeholderTextColor={palette.textSecondary}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        autoFocus
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={palette.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
});
