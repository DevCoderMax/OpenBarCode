import React from 'react';
import { TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface BarcodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onScan: () => void;
  onSearch: () => void;
}

export function BarcodeInput({ value, onChangeText, onScan, onSearch }: BarcodeInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  
  return (
    <ThemedView style={styles.container}>
      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        placeholder="Digite o código de barras"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSearch}
        keyboardType="number-pad"
        placeholderTextColor="#999"
        returnKeyType="search"
      />
      <TouchableOpacity onPress={onScan} style={styles.iconButton}>
        <MaterialIcons name="photo-camera" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onSearch} style={styles.iconButton}>
        <MaterialIcons name="search" size={24} color="white" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
  },
  iconButton: {
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});