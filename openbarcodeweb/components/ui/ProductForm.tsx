import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { Input } from './Input';
import { Button } from './Button';
import { ThemedSwitch } from './ThemedSwitch';
import { CheckboxGroup } from './Checkbox';
import { SearchablePicker } from './SearchablePicker';
import { ImageUpload } from './ImageUpload';
import { Product } from '../../models/Product';
import { parseImageUrls, stringifyImageUrls } from '../../utils/imageUtils';

const measureTypeItems = ['l', 'ml', 'kg', 'g', 'un'].map(type => ({ label: type.toUpperCase(), value: type }));

interface ProductFormProps {
  product: Product;
  onUpdate: (updates: Partial<Product>) => void;
  onSave: () => void;
  isSaving: boolean;
  isNewProduct: boolean;
}

export function ProductForm({ product, onUpdate, onSave, isSaving, isNewProduct }: ProductFormProps) {
  const imagesArray = parseImageUrls(product?.images || null);

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        {isNewProduct ? 'Adicionar Novo Produto' : 'Editar Produto'}
      </ThemedText>


      <Input
        label="Nome do Produto"
        value={product.name}
        onChangeText={(text) => onUpdate({ name: text })}
      />
      
      <Input
        label="Descrição"
        value={product.description || ''}
        onChangeText={(text) => onUpdate({ description: text })}
        multiline
      />
      
      <Input
        label="Código de Barras"
        value={product.barcode || ''}
        editable={false}
      />
      
      <ImageUpload
        label="Product Images"
        images={imagesArray}
        onImagesChange={(images) => onUpdate({ images: stringifyImageUrls(images) })}
        maxImages={5}
      />
      
      <Input
        label="Valor da Medida"
        value={String(product.measure_value || '')}
        onChangeText={(text) => onUpdate({ measure_value: parseFloat(text.replace(/[^0-9.,]/g, '')) })}
        keyboardType="numeric"
      />
      
      <CheckboxGroup
        label="Tipo de Medida"
        options={measureTypeItems}
        selectedValue={product.measure_type || 'un'}
        onValueChange={(value) => onUpdate({ measure_type: value as string })}
      />
      
      <Input
        label="Quantidade"
        value={String(product.qtt || '')}
        onChangeText={(text) => onUpdate({ qtt: parseInt(text.replace(/[^0-9]/g, ''), 10) || 0 })}
        keyboardType="numeric"
      />
      
      <SearchablePicker
        label="Marca"
        selectedLabel={product.brand ? product.brand.name : ''}
        onValueChange={(brand) => onUpdate({ brand_id: brand.id, brand: brand })}
      />
      
      <ThemedSwitch
        label="Status (Ativo)"
        value={product.status}
        onValueChange={(value) => onUpdate({ status: value })}
      />

      <Button
        title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
        onPress={onSave}
        disabled={isSaving}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  saveButton: {
    marginTop: 24,
  },
});