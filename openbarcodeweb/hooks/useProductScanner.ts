import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Product } from '../models/Product';
import { ProductService } from '../services/productService';

export function useProductScanner() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productFound, setProductFound] = useState(false);

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
      Alert.alert('Atenção', 'Por favor, digite ou escaneie um código de barras.');
      return;
    }

    setIsLoading(true);
    setProduct(null);

    try {
      const data = await ProductService.searchProduct(barcode);

      if (data.length > 0) {
        setProduct(data[0]);
        setProductFound(true);
        Alert.alert('Sucesso', 'Produto encontrado e pronto para edição.');
      } else {
        setProduct(ProductService.createEmptyProduct(barcode));
        setProductFound(false);
        Alert.alert('Informação', 'Produto não encontrado. Preencha os dados para adicioná-lo.');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao buscar o produto.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveProduct = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      await ProductService.saveProduct(product, productFound);
      Alert.alert('Sucesso', `Produto ${productFound ? 'atualizado' : 'criado'} com sucesso!`);
      setProduct(null);
      setProductFound(false);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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