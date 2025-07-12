import { useState } from 'react';
import { API_URL } from '@/constants/Api';

export interface UploadedImage {
  object_name: string;
  etag: string;
  size: number;
  last_modified: string;
}

// Novo tipo para mobile
export type UploadableImage = File | { uri: string; name: string; type: string };

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: UploadableImage): Promise<UploadedImage | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file instanceof File) {
        // Web
        formData.append('file', file);
      } else {
        // Mobile
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }

      const response = await fetch(`${API_URL}/api/v1/images/`, {
        method: 'POST',
        body: formData,
        headers: file instanceof File ? {} : { 'Content-Type': 'multipart/form-data' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload image');
      }

      const uploadedImage = await response.json();
      return uploadedImage;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (etag: string): string => {
    return `${API_URL}/api/v1/images/download/${etag}`;
  };

  const deleteImage = async (etag: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/v1/images/${etag}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  };

  return {
    uploadImage,
    getImageUrl,
    deleteImage,
    uploading,
    error,
  };
} 