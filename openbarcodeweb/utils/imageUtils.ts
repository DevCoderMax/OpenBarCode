import { API_URL } from '@/constants/Api';

/**
 * Converte uma string de imagens separadas por vírgula em um array
 */
export function parseImageUrls(imagesString: string | null): string[] {
  if (!imagesString) return [];
  
  return imagesString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);
}

/**
 * Converte um array de URLs de imagem em uma string separada por vírgula
 */
export function stringifyImageUrls(images: string[]): string {
  return images.join(', ');
}

/**
 * Obtém a URL de download de uma imagem pelo ETag
 */
export function getImageDownloadUrl(etag: string): string {
  return `${API_URL}/api/v1/images/download/${etag}`;
}

/**
 * Gera uma URL de thumbnail a partir da URL de download
 */
export function getThumbnailUrl(url: string, w = 100, h = 100, quality = 60) {
  if (!url) return '';
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${w}&h=${h}&quality=${quality}`;
}

/**
 * Extrai o ETag de uma URL de download de imagem
 */
export function extractEtagFromUrl(url: string): string | null {
  const match = url.match(/\/download\/([^\/]+)$/);
  return match ? match[1] : null;
}

/**
 * Valida se uma URL é uma imagem válida
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Obtém a primeira imagem de uma string de imagens
 */
export function getFirstImage(imagesString: string | null): string | null {
  const images = parseImageUrls(imagesString);
  return images.length > 0 ? images[0] : null;
} 