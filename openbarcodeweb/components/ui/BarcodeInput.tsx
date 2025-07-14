import React from 'react';
import { TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '../ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface BarcodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onScan: () => void;
  onSearch: () => void;
  isLoading?: boolean;
  onLoadingAction?: () => void;
  isDownloadEnabled?: boolean;
}

export function BarcodeInput({ value, onChangeText, onScan, onSearch, isLoading = false, onLoadingAction, isDownloadEnabled = false }: BarcodeInputProps) {
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
      {onLoadingAction && (
        <TouchableOpacity 
          onPress={onLoadingAction} 
          style={[
            styles.iconButton, 
            isLoading && styles.loadingButton,
            !isDownloadEnabled && styles.disabledButton
          ]}
          disabled={!isDownloadEnabled}
        >
          {isLoading ? (
            <ActivityIndicator size={24} color="white" />
          ) : (
            <MaterialIcons 
              name="cloud-download" 
              size={24} 
              color={!isDownloadEnabled ? "#999" : "white"} 
            />
          )}
        </TouchableOpacity>
      )}
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
  loadingButton: {
    backgroundColor: '#dc3545',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});