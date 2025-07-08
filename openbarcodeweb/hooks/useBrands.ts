import { useState, useEffect } from 'react';
import { Brand } from '@/types';
import { API_URL } from '../constants/Api';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/v1/brands`);
        if (!response.ok) {
          throw new Error('Failed to fetch brands');
        }
        const data = await response.json();
        setBrands(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBrands();
  }, []);

  return { brands, loading, error };
}
