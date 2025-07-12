import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useImageUpload, UploadableImage } from '@/hooks/useImageUpload';
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
  const { uploadImage, getImageUrl, deleteImage, uploading } = useImageUpload();
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const handleImagePick = async () => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload up to ${maxImages} images.`);
      return;
    }

    if (Platform.OS === 'web') {
      // Web implementation - create file input dynamically
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          await handleFileSelect(target.files[0]);
        }
      };
      input.click();
    } else {
      // Mobile implementation - show modal with options
      setShowImagePickerModal(true);
    }
  };

  const handleTakePhoto = async () => {
    setShowImagePickerModal(false);
    
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageAsset(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectFromGallery = async () => {
    setShowImagePickerModal(false);
    
    try {
      // Request gallery permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to select images.');
        return;
      }

      // Pick image from gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processImageAsset(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const processImageAsset = async (asset: any) => {
    // Validate file size (5MB limit)
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert('File Too Large', 'Image must be smaller than 5MB.');
      return;
    }

    // Enviar como objeto { uri, name, type }
    const imageForUpload: UploadableImage = {
      uri: asset.uri,
      name: asset.fileName || 'image.jpg',
      type: asset.mimeType || 'image/jpeg',
    };

    const uploadedImage = await uploadImage(imageForUpload);
    if (uploadedImage) {
      const imageUrl = getImageUrl(uploadedImage.etag);
      onImagesChange([...images, imageUrl]);
    }
  };

  const handleFileSelect = async (file: File) => {
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

  const triggerImagePick = () => {
    handleImagePick();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.label}>
        {label} ({images.length}/{maxImages})
      </ThemedText>

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
            onPress={triggerImagePick}
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

      {/* Modal para escolher entre câmera e galeria */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              Adicionar Imagem
            </ThemedText>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleTakePhoto}
            >
              <ThemedText style={styles.modalOptionText}>📷 Tirar Foto</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleSelectFromGallery}
            >
              <ThemedText style={styles.modalOptionText}>🖼️ Selecionar da Galeria</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, styles.cancelOption]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <ThemedText style={styles.cancelOptionText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  cancelOptionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff4444',
  },
}); 