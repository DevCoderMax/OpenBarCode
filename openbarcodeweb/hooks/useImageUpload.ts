import { useState } from 'react';
import { API_URL } from '@/constants/Api';
import { getImageDownloadUrl } from '@/utils/imageUtils';

export interface UploadedImage {
  object_name: string;
  etag: string;
  size: number;
  last_modified: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<UploadedImage | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/api/v1/images/`, {
        method: 'POST',
        body: formData,
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
    return getImageDownloadUrl(etag);
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