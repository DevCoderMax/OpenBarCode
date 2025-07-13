import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../models/Product';
import { ProductService } from '../services/productService';
import { useNotification } from './useNotification';

export function useProductScanner() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const { alert } = useNotification();

  useFocusEffect(
    useCallback(() => {
      return () => {
        setProduct(null);
        setProductFound(false);
      };
    }, [])
  );

  const searchProduct = async (barcode: string) => {
    if (!barcode) {
      alert('Atenção', 'Por favor, digite ou escaneie um código de barras.', 'warning');
      return;
    }

    setIsLoading(true);
    setProduct(null);

    try {
      const data = await ProductService.searchProduct(barcode);

      if (data.length > 0) {
        setProduct(data[0]);
        setProductFound(true);
        alert('Sucesso', 'Produto encontrado e pronto para edição.', 'success');
      } else {
        setProduct(ProductService.createEmptyProduct(barcode));
        setProductFound(false);
        alert('Informação', 'Produto não encontrado. Preencha os dados para adicioná-lo.', 'info');
      }
    } catch (error: any) {
      alert('Erro', error.message || 'Ocorreu um erro ao buscar o produto.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProduct = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      await ProductService.saveProduct(product, productFound);
      alert('Sucesso', `Produto ${productFound ? 'atualizado' : 'criado'} com sucesso!`, 'success');
      setProduct(null);
      setProductFound(false);
    } catch (error: any) {
      alert('Erro', error.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProduct = (updates: Partial<Product>) => {
    if (product) {
      setProduct({ ...product, ...updates });
    }
  };

  const clearProduct = () => {
    setProduct(null);
    setProductFound(false);
  };

  return {
    product,
    isLoading,
    isSaving,
    productFound,
    searchProduct,
    saveProduct,
    updateProduct,
    clearProduct,
  };
}