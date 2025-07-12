import { useState } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemedSwitch } from '@/components/ui/ThemedSwitch';
import { useProductDetail } from '@/hooks/useProductDetail';
import { API_URL } from '../../constants/Api';
import { CheckboxGroup } from '@/components/ui/Checkbox';
import { SearchablePicker } from '@/components/ui/SearchablePicker';

const measureTypeItems = ['l', 'ml', 'kg', 'g', 'un'].map(type => ({ label: type.toUpperCase(), value: type }));

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { product, loading, error, setProduct } = useProductDetail(id);

  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error || !product) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">Error: {error || 'Product not found'}</ThemedText>
      </ThemedView>
    );
  }

  const handleUpdate = async () => {
    if (!product) return;

    setIsSaving(true);
    try {
      const productData: any = {
        name: product.name,
        description: product.description,
        barcode: product.barcode,
        images: product.images,
        status: product.status,
        measure_type: product.measure_type,
        measure_value: product.measure_value ? parseFloat(String(product.measure_value).replace(',', '.')) : undefined,
        qtt: product.qtt ? parseInt(String(product.qtt), 10) : undefined,
        brand_id: product.brand_id,
      };

      // Remove undefined keys so we don't send them
      Object.keys(productData).forEach(key => productData[key] === undefined && delete productData[key]);

      const response = await fetch(`${API_URL}/api/v1/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update product');
      }

      Alert.alert('Success', 'Product updated successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>Edit Product</ThemedText>

        <Input
          label="Name"
          value={product.name}
          onChangeText={(text) => setProduct({ ...product, name: text })}
        />
        <Input
          label="Description"
          value={product.description || ''}
          onChangeText={(text) => setProduct({ ...product, description: text })}
          multiline
        />
        <Input
          label="Barcode"
          value={product.barcode || ''}
          onChangeText={(text) => setProduct({ ...product, barcode: text })}
        />
        <Input
          label="Imagens (URL, separadas por vírgula)"
          value={product.images || ''}
          onChangeText={(text) => setProduct({ ...product, images: text })}
          multiline
        />

        <Input
          label="Valor da Medida"
          value={String(product.measure_value || '')}
          onChangeText={(text) => setProduct({ ...product, measure_value: text.replace(/[^0-9.,]/g, '') })}
          keyboardType="numeric"
        />

        <CheckboxGroup
          label="Tipo de Medida"
          options={measureTypeItems}
          selectedValue={product.measure_type || 'un'}
          onValueChange={(value) => setProduct({ ...product, measure_type: value as string })}
        />

        <Input
          label="Quantidade"
          value={String(product.qtt || '')}
          onChangeText={(text) => setProduct({ ...product, qtt: Number(text.replace(/[^0-9]/g, '')) })}
          keyboardType="numeric"
        />

        <SearchablePicker
          label="Marca"
          selectedLabel={product.brand ? product.brand.name : ''}
          onValueChange={(brand) => {
            setProduct({ ...product, brand_id: brand.id, brand: brand });
          }}
        />

        <ThemedSwitch
          label="Status (Ativo)"
          value={product.status}
          onValueChange={(value) => setProduct({ ...product, status: value })}
        />

        <Button
          title={isSaving ? 'Saving...' : 'Save Changes'}
          onPress={handleUpdate}
          disabled={isSaving}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },

});
