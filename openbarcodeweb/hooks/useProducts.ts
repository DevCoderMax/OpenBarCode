import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';

import { API_URL } from '@/constants/Api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    console.log('Initiating fetch/refetch...');
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/api/v1/products`;
      console.log('Fetching products from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch products:', errorText);
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}
