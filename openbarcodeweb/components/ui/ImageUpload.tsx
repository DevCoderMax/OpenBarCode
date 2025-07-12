import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Button } from './Button';
import { extractEtagFromUrl } from '@/utils/imageUtils';

interface ImageUploadProps {
  label?: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({ 
  label = "Images", 
  images, 
  onImagesChange, 
  maxImages = 5 
}: ImageUploadProps) {
  const { uploadImage, getImageUrl, deleteImage, uploading, error } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      Alert.alert('Invalid File', 'Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('File Too Large', 'Image must be smaller than 5MB.');
      return;
    }

    const uploadedImage = await uploadImage(file);
    if (uploadedImage) {
      const imageUrl = getImageUrl(uploadedImage.etag);
      onImagesChange([...images, imageUrl]);
    } else if (error) {
      Alert.alert('Upload Failed', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = images[index];
    const etag = extractEtagFromUrl(imageUrl);
    
    if (etag) {
      const success = await deleteImage(etag);
      if (success) {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
      } else {
        Alert.alert('Error', 'Failed to delete image.');
      }
    } else {
      // If we can't extract etag, just remove from local state
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.label}>
        {label} ({images.length}/{maxImages})
      </ThemedText>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Image grid */}
      <View style={styles.imageGrid}>
        {images.map((imageUrl, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: imageUrl }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <ThemedText style={styles.removeButtonText}>×</ThemedText>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add image button */}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={triggerFileSelect}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" />
            ) : (
              <ThemedText style={styles.addButtonText}>+</ThemedText>
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#666',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
  },
}); 