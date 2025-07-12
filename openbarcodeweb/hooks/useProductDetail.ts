import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { API_URL } from '@/constants/Api';

export function useProductDetail(productId: string | string[] | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        setLoading(true);
                const url = `${API_URL}/api/v1/products/${productId}`;
        console.log('Fetching product detail from:', url);
        const response = await fetch(url);
        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch product details:', errorText);
          throw new Error(`Failed to fetch product details: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return { product, loading, error, setProduct };
}
